import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";

/** ===== 서버 타입 ===== */
interface QuizItem {
  itemId: number;
  order: number;
  prompt: string;
  choices: string[];
}
type SessionStatus = "ACTIVE" | "SUBMITTED" | "EXPIRED";

interface QuizSession {
  sessionId: number;
  expiresAt: string | null;
  numQuestions: number;
  category: string;
  status: SessionStatus;
  answeredCount: number;
  total: number;
  nextItemOrder?: number | null;
  attemptsLeftToday?: number;
  items: QuizItem[];
}

interface AnswerResult {
  sessionId?: number;
  itemId: number;
  correct: boolean;
  correctIndex?: number;
  awardedPoints: number;
  totalAwardedPoints?: number;
  answeredCount?: number;
  total: number;
  completed: boolean;
  nextItemOrder?: number;
  explanation?: string;
  submittedAt?: string;
}

/** ===== 설정/이미지 ===== */
const ACTIVE_KEYS = ["activeQuizSessionId:shop", "activeQuizSessionId"];

let treeImg: any;
try {
  treeImg = require("../../assets/images/tree_logo.png");
} catch {}

/** ===== 유틸 ===== */
const secsLeft = (iso: string) =>
  Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));

const normalizeSession = (raw: any): QuizSession => ({
  sessionId: raw?.sessionId ?? raw?.session_id ?? raw?.id,
  expiresAt: raw?.expiresAt ?? raw?.expires_at ?? null,
  numQuestions: raw?.numQuestions ?? raw?.num_questions ?? raw?.total ?? 3,
  category: raw?.category ?? "etc",
  status: (raw?.status ?? "ACTIVE") as SessionStatus,
  answeredCount: raw?.answeredCount ?? raw?.answered_count ?? 0,
  total: raw?.total ?? raw?.numQuestions ?? 3,
  nextItemOrder: raw?.nextItemOrder ?? raw?.next_item_order ?? raw?.next ?? undefined,
  attemptsLeftToday: raw?.attemptsLeftToday ?? raw?.attempts_left_today ?? undefined,
  items: (raw?.items ?? []).map((it: any) => ({
    itemId: it?.itemId ?? it?.item_id,
    order: it?.order ?? it?.item_order,
    prompt: it?.prompt,
    choices: it?.choices ?? [],
  })),
});

const normalizeAnswer = (raw: any): AnswerResult => ({
  sessionId: raw?.sessionId ?? raw?.session_id,
  itemId: raw?.itemId ?? raw?.item_id,
  correct: !!raw?.correct,
  correctIndex: raw?.correctIndex ?? raw?.correct_index,
  awardedPoints: raw?.awardedPoints ?? raw?.awarded_points ?? 0,
  totalAwardedPoints: raw?.totalAwardedPoints ?? raw?.total_awarded_points,
  answeredCount: raw?.answeredCount ?? raw?.answered_count,
  total: raw?.total ?? 3,
  completed: !!(raw?.completed ?? raw?.finished),
  nextItemOrder: raw?.nextItemOrder ?? raw?.next_item_order,
  explanation: raw?.explanation,
  submittedAt: raw?.submittedAt ?? raw?.submitted_at,
});

/** ===== 저장소 ===== */
const saveActiveId = async (id: number) => {
  await Promise.all(ACTIVE_KEYS.map((k) => AsyncStorage.setItem(k, String(id))));
};
const readActiveId = async () => {
  for (const k of ACTIVE_KEYS) {
    const raw = await AsyncStorage.getItem(k);
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n)) return n;
  }
  return null;
};
const clearActiveId = async () => {
  await Promise.all(ACTIVE_KEYS.map((k) => AsyncStorage.removeItem(k)));
};

/** ===== 피드백 배너 ===== */
function FeedbackBanner({
  visible,
  correct,
  points,
  explanation,
}: {
  visible: boolean;
  correct: boolean;
  points?: number;
  explanation?: string;
}) {
  if (!visible) return null;
  const ok = correct;
  return (
    <View
      style={[
        styles.feedbackWrap,
        { backgroundColor: ok ? "#ECFDF5" : "#FEF2F2", borderColor: ok ? "#A7F3D0" : "#FECACA" },
      ]}
    >
      <Text style={[styles.feedbackText, { color: ok ? "#065F46" : "#991B1B" }]}>
        {ok ? `정답! ${points ? `+${points}점` : ""}` : "오답입니다. 다음 문제로 이동합니다."}
      </Text>
      {!!explanation && <Text style={styles.feedbackExplain}>💡 {explanation}</Text>}
    </View>
  );
}

/** ===== 메인 ===== */
export default function QuizScreen() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [remainSec, setRemainSec] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [curIdx, setCurIdx] = useState(0);
  const [answering, setAnswering] = useState(false);
  const inFlightRef = useRef(false);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; points?: number; explanation?: string }>({ show: false, correct: false });
  const [correctSoFar, setCorrectSoFar] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    setFeedback((f) => ({ ...f, show: false }));
  }, [curIdx]);

  const softExpired = useMemo(() => typeof remainSec === "number" && remainSec <= 0, [remainSec]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = useCallback((expiresAt: string | null) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!expiresAt) {
      setRemainSec(null);
      return;
    }
    setRemainSec(secsLeft(expiresAt));
    timerRef.current = setInterval(() => {
      setRemainSec((prev) =>
        typeof prev === "number" ? Math.max(prev - 1, 0) : secsLeft(expiresAt)
      );
    }, 1000);
  }, []);

  /** ===== 세션 부팅/재개 ===== */
  const hydrate = useCallback(async (raw: any) => {
    const s = normalizeSession(raw);
    setSession(s);

    // 선택지 상태 초기화
    const map: Record<number, number | null> = {};
    s.items.forEach((it) => (map[it.itemId] = null));
    setAnswers(map);

    setCorrectSoFar(0);
    setShowCompletion(false);

    const nextOrder = s.nextItemOrder ?? 1;
    const nextIdx = Math.max(0, Math.min(s.items.length - 1, (nextOrder || 1) - 1));
    setCurIdx(nextIdx);

    startCountdown(s.expiresAt ?? null);
    await AsyncStorage.multiSet(ACTIVE_KEYS.map((k) => [k, String(s.sessionId)] as [string, string]));
    setErrorText(null);
  }, [startCountdown]);

 // 완전 교체 추천: resumeFromActive
const resumeFromActive = useCallback(async () => {
  try {
    // 1) 저장된 세션 ID 있으면 먼저 시도
    const saved = await readActiveId();
    if (saved) {
      const full = await api.get(`/api/quiz/sessions/${saved}`);
      await hydrate(full.data);
      return true;
    }

    // 2) 서버 active 조회 → id만 얻어 상세 재조회
    const r = await api.get(`/api/quiz/sessions/active`);
    const meta = r?.data?.session;
    if (r?.data?.hasActive && meta) {
      const sid = meta.sessionId ?? meta.id;
      if (sid) {
        const full = await api.get(`/api/quiz/sessions/${sid}`);
        await hydrate(full.data);
        return true;
      }
    }
    return false;
  } catch (e: any) {
    await clearActiveId();
    const st = e?.response?.status;
    if (st === 401 || st === 403) setErrorText("로그인이 필요합니다(권한 오류). 다시 로그인 해주세요.");
    else setErrorText("세션 이어받기 실패: " + (e?.message || st));
    return false;
  }
}, [hydrate]);

const createSession = useCallback(async () => {
  try {
    const r = await api.post(`/api/quiz/sessions`, {});
    // 성공이면 바로 hydrate
    await hydrate(r.data);
    return true;
  } catch (e: any) {
    const st = e?.response?.status;
    const code = e?.response?.data?.error?.code || e?.response?.data?.code;

    // 이미 활성 세션 → /active로 id 얻고 상세 re-fetch
    if (st === 409 || code === "SESSION_ALREADY_ACTIVE") {
      const a = await api.get(`/api/quiz/sessions/active`);
      const meta = a?.data?.session;
      const sid = meta?.sessionId ?? meta?.id;
      if (a?.data?.hasActive && sid) {
        const full = await api.get(`/api/quiz/sessions/${sid}`);
        await hydrate(full.data);
        return true;
      }
      // 그래도 실패하면 마지막 시도로 resumeFromActive
      if (await resumeFromActive()) return true;
      setErrorText("이미 진행 중인 세션이 있어요. 이어받기를 시도해주세요.");
      return false;
    }

    if (st === 401 || st === 403) setErrorText("로그인이 필요합니다(권한 오류). 다시 로그인 해주세요.");
    else setErrorText(`세션 생성 실패: ${st ?? e?.message}`);
    return false;
  }
}, [hydrate, resumeFromActive]);

  const boot = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setErrorText(null);
    try {
      if (await resumeFromActive()) return;
      await createSession();
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [resumeFromActive, createSession]);

  // ✅ 여기 깨져 있었음
  useEffect(() => {
    boot();
  }, [boot]);

  /** ===== 제출 ===== */
  const onSelect = useCallback(async (itemId: number, idx0: number) => {
    if (!session || softExpired || answering) return;
    if (answers[itemId] != null) return;

    setAnswering(true);
    setAnswers((prev) => ({ ...prev, [itemId]: idx0 }));

    try {
      const payload = { item_id: Number(itemId), answer_idx: Number(idx0 + 1) };
      console.log("[submit]", session.sessionId, payload);
      const res = await api.post(`/api/quiz/sessions/${session.sessionId}/answer`, payload, { headers: { "Content-Type": "application/json" } });
      const r = normalizeAnswer(res.data);

      setFeedback({ show: true, correct: r.correct, points: r.awardedPoints, explanation: r.explanation });
      setSession((prev) =>
        prev
          ? {
              ...prev,
              answeredCount: r.answeredCount ?? Math.min((prev.answeredCount ?? 0) + 1, prev.total),
              status: r.completed ? "SUBMITTED" : prev.status,
              nextItemOrder: r.nextItemOrder,
            }
          : prev
      );
      if (r.correct) setCorrectSoFar((n) => n + 1);
      if (r.completed) { setShowCompletion(true); return; }
      const nextOrder = r.nextItemOrder ?? (session?.items[curIdx]?.order ?? 0) + 1;
      const nextIdx = Math.max(0, Math.min((session?.items.length ?? 1) - 1, nextOrder - 1));
      setCurIdx(nextIdx);
    } catch (e: any) {
      const st = e?.response?.status;
      const data = e?.response?.data;
      const msgRaw = data?.error?.message || data?.message;
      if (st === 400) {
        console.log("[answer 400]", data);
        Alert.alert("제출 형식 오류", msgRaw || "요청 형식 오류(400)");
        setAnswers((prev) => ({ ...prev, [itemId]: null }));
        setFeedback({ show: false, correct: false });
      } else if (st === 410 || st === 404) {
        Alert.alert("세션 만료됨", "세션이 만료되었거나 찾을 수 없습니다. 새로 시작하세요.");
        await clearActiveId();
        setSession(null);
      } else {
        console.log("[answer fail]", data);
        Alert.alert("오류", msgRaw || "답변 제출에 실패했습니다.");
        setAnswers((prev) => ({ ...prev, [itemId]: null }));
        setFeedback({ show: false, correct: false });
      }
    } finally {
      setAnswering(false);
    }
  }, [session, softExpired, answers, answering, curIdx]);

  const onFinish = useCallback(async () => {
    await clearActiveId();
    setSession(null);
    setAnswers({});
    setShowCompletion(false);
    setFeedback({ show: false, correct: false });
    setErrorText("세 문제 모두 풀었어요! 오늘은 여기까지 🎉 내일 다시 도전하세요.");
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerFull}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>퀴즈 정보를 불러오는 중…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.heroWrap}>
          {treeImg ? (
            <Image source={treeImg} style={styles.hero} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 72 }}>🌳</Text>
          )}
        </View>
        <Divider />
        <View style={styles.centerBody}>
          <Text style={styles.infoText}>
            {errorText || "퀴즈를 시작할 수 없습니다. 잠시 후 다시 시도해주세요."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.heroWrap}>
        {treeImg ? (
          <Image source={treeImg} style={styles.hero} resizeMode="contain" />
        ) : (
          <Text style={{ fontSize: 60 }}>🌳</Text>
        )}
      </View>
      <Divider />

      <View style={styles.container}>
        {softExpired && (
          <View style={styles.expiredBanner}>
            <Text style={styles.expiredText}>세션이 만료되었습니다</Text>
            <TouchableOpacity onPress={onFinish} style={styles.expiredButton}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>새로 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}

        <FeedbackBanner visible={feedback.show} correct={feedback.correct} points={feedback.points} explanation={feedback.explanation} />

        <View style={styles.qHeader}>
          <Text style={styles.qHeaderText}>Q. {session.items[curIdx]?.prompt || ""}</Text>
        </View>

        {session.items[curIdx] && (
          <View>
            {session.items[curIdx].choices.map((c, idx) => {
              const item = session.items[curIdx];
              const selected = answers[item.itemId] === idx;
              const label = String.fromCharCode(65 + idx);
              return (
                <TouchableOpacity
                  key={`${item.itemId}-${idx}`}
                  activeOpacity={0.9}
                  style={[styles.pill, selected && styles.pillSelected]}
                  onPress={() => onSelect(item.itemId, idx)}
                  disabled={softExpired || answering || answers[item.itemId] != null}
                >
                  <View style={[styles.pillBadge, selected && styles.pillBadgeSelected]}>
                    <Text style={[styles.pillBadgeText, selected && { color: "#fff" }]}>{label}</Text>
                  </View>
                  <Text style={[styles.pillText, selected && { color: "#fff" }]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.progressText}>
          진행 {session.answeredCount}/{session.total} · 정답 {correctSoFar}/{session.total}
        </Text>
        {typeof remainSec === "number" && (
          <Text style={styles.timer}>
            만료까지 {Math.floor(remainSec / 60)}:{String(remainSec % 60).padStart(2, "0")}
          </Text>
        )}
      </View>

      {showCompletion && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>오늘의 퀴즈 완료 🎉</Text>
            <Text style={styles.overlayBody}>
              정답 {correctSoFar}/{session.total} · 수고했어요!
            </Text>
            <Text style={[styles.overlayBody, { marginTop: 4, color: "#6b7280" }]}>
              오늘은 여기까지. 내일 다시 도전하세요!
            </Text>
            <TouchableOpacity onPress={onFinish} style={styles.overlayBtn}>
              <Text style={styles.overlayBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function Divider() { return <View style={styles.divider} />; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  centerFull: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  centerBody: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  heroWrap: { alignItems: "center", paddingTop: 4 },
  hero: { width: 160, height: 160 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginHorizontal: 16, marginVertical: 16 },
  container: { flex: 1, paddingHorizontal: 16 },

  qHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  qHeaderText: { flex: 1, fontSize: 18, fontWeight: "600", color: "#111827", lineHeight: 28 },

  pill: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 28, backgroundColor: "#fff", borderWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb", marginBottom: 12 },
  pillSelected: { backgroundColor: "#06D16E", borderColor: "#10b981" },
  pillBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0", alignItems: "center", justifyContent: "center", marginRight: 10 },
  pillBadgeSelected: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "transparent" },
  pillBadgeText: { fontSize: 12, fontWeight: "800", color: "#10b981" },
  pillText: { fontSize: 15, color: "#000000ff", flexShrink: 1 },

  progressText: { marginTop: 8, textAlign: "center", color: "#4b5563" },
  timer: { marginTop: 10, textAlign: "center", color: "#6b7280" },
  infoText: { fontSize: 16, color: "#4b5563", textAlign: "center", lineHeight: 24 },

  expiredBanner: { padding: 12, backgroundColor: "#FEF2F2", borderRadius: 8, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#fecaca" },
  expiredText: { color: "#991B1B", fontWeight: "700", marginBottom: 8, textAlign: "center" },
  expiredButton: { backgroundColor: "#111827", paddingVertical: 10, borderRadius: 8, alignItems: "center" },

  feedbackWrap: { borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 10 },
  feedbackText: { fontWeight: "700", textAlign: "center" },
  feedbackExplain: { marginTop: 6, textAlign: "center", color: "#374151" },

  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  overlayCard: { width: "84%", backgroundColor: "#fff", borderRadius: 16, padding: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb" },
  overlayTitle: { fontSize: 18, fontWeight: "800", color: "#111827", textAlign: "center" },
  overlayBody: { marginTop: 8, fontSize: 14, color: "#111827", textAlign: "center" },
  overlayBtn: { marginTop: 14, backgroundColor: "#111827", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  overlayBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});