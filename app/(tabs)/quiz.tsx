// app/(tabs)/shop.native.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { api } from "../lib/api";

/** ===== 서버 타입 ===== */
interface QuizItem {
  itemId: number;
  order: number;
  prompt: string;
  choices: string[];
}
interface QuizSession {
  sessionId: number;
  expiresAt: string;
  numQuestions: number;
  category: string;
  attemptsLeftToday: number;
  items: QuizItem[];
}
interface SubmitResult {
  sessionId: number;
  category: string;
  correctCount: number;
  total: number;
  awardedPoints: number;
  details: { itemId: number; correct: boolean }[];
  submittedAt: string;
}

/** ===== 설정 ===== */
const ACTIVE_KEY = "activeQuizSessionId:shop";
const USE_ATTEMPTS_ENDPOINT = false;

/** ===== 이미지 (없으면 이모지 폴백) ===== */
let treeImg: any, bottleImg: any, quizBadgeImg: any, cartImg: any;
try { treeImg = require("../../assets/images/tree_logo.png"); } catch {}
try { bottleImg = require("../../assets/images/bottle.png"); } catch {}
try { quizBadgeImg = require("../../assets/images/questionBox.png"); } catch {}
try { cartImg = require("../../assets/images/cart.png"); } catch {}

/** ===== 유틸 ===== */
const secsLeft = (iso: string) =>
  Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));

function extractActiveSessionId(ax: AxiosError<any>): number | null {
  const hdr = ax.response?.headers;
  const byHeader =
    (hdr?.["x-active-session-id"] as any) ??
    (hdr?.["X-Active-Session-Id"] as any) ??
    (hdr?.["x-session-id"] as any);
  if (byHeader && !isNaN(Number(byHeader))) return Number(byHeader);

  const loc = (hdr?.["location"] as string) || (hdr?.["Location"] as string);
  if (loc) {
    const m = loc.match(/\/sessions\/(\d+)(?:\/)?$/);
    if (m?.[1]) return Number(m[1]);
  }

  const data = ax.response?.data;
  const cands = [data?.sessionId, data?.error?.sessionId, data?.session?.sessionId, data?.data?.sessionId];
  for (const v of cands) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  try {
    const s = JSON.stringify(data);
    const m = s.match(/"sessionId"\s*:\s*(\d+)/);
    if (m?.[1]) return Number(m[1]);
  } catch {}
  return null;
}

/** 저장소 */
const saveActiveId = (id: number) => AsyncStorage.setItem(ACTIVE_KEY, String(id));
const readActiveId = async () => {
  const raw = await AsyncStorage.getItem(ACTIVE_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
};
const clearActiveId = () => AsyncStorage.removeItem(ACTIVE_KEY);

/** (옵션) 시도 수 */
async function getAttemptsLeft(): Promise<number | null> {
  if (!USE_ATTEMPTS_ENDPOINT) return null;
  try {
    const r = await api.get<{ attemptsLeftToday: number }>("/api/quiz/attempts/today");
    return r.data?.attemptsLeftToday ?? null;
  } catch { return null; }
}

/** ===== 메인 ===== */
export default function ShopQuiz() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  // 카운트다운
  const [remainSec, setRemainSec] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  const startCountdown = useCallback((expiresAt: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainSec(secsLeft(expiresAt));
    timerRef.current = setInterval(() => {
      setRemainSec((prev) => (typeof prev === "number" ? Math.max(prev - 1, 0) : secsLeft(expiresAt)));
    }, 1000);
  }, []);
  useEffect(() => { if (remainSec === 0) clearActiveId().catch(()=>{}); }, [remainSec]);

  const hydrate = useCallback(async (s: QuizSession) => {
    setSession(s);
    const map: Record<number, number | null> = {};
    s.items.forEach((it) => (map[it.itemId] = null));
    setAnswers(map);
    setAttemptsLeft(typeof s.attemptsLeftToday === "number" ? s.attemptsLeftToday : null);
    if (s.expiresAt) startCountdown(s.expiresAt);
    await saveActiveId(s.sessionId);
  }, [startCountdown]);

  const fetchById = useCallback(async (sid: number) => {
    try {
      const r = await api.get<QuizSession>(`/api/quiz/sessions/${sid}`);
      await hydrate(r.data);
      setErrorText(null);
      return true;
    } catch (e: any) {
      const st = e?.response?.status;
      if (st === 410 || st === 404) await clearActiveId();
      setErrorText(st === 410 ? "세션이 만료되었습니다(410)." : "세션을 불러올 수 없습니다.");
      return false;
    }
  }, [hydrate]);

  const createSession = useCallback(async () => {
    setLoading(true); setErrorText(null);
    try {
      const r = await api.post<QuizSession>("/api/quiz/sessions", {});
      await hydrate(r.data);
    } catch (e: any) {
      const st = e?.response?.status;
      if (st === 409) {
        const sid = extractActiveSessionId(e as AxiosError<any>);
        if (sid) { const ok = await fetchById(sid); if (ok) { setLoading(false); return; } }
        const saved = await readActiveId();
        if (saved) { const ok = await fetchById(saved); if (ok) { setLoading(false); return; } }
        setErrorText("이미 진행 중인 세션이 있어요. 제출/만료 후 다시 시작하거나, 409 응답에 sessionId(또는 Location 헤더)를 포함해 주세요.");
      } else if (st === 401) setErrorText("인증이 필요합니다(401).");
      else if (st === 403) setErrorText("접근이 거부되었습니다(403).");
      else if (st === 429) setErrorText("일일 시도 한도를 초과했습니다(429).");
      else setErrorText(`세션 생성 실패: ${st ?? e?.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchById, hydrate]);

  const boot = useCallback(async () => {
    setLoading(true);
    const saved = await readActiveId();
    if (saved) { const ok = await fetchById(saved); if (ok) { setLoading(false); return; } }
    await createSession();
    setLoading(false);
  }, [fetchById, createSession]);

  useEffect(() => { boot(); }, [boot]);

  /** 단일 문항 UI 기준 제출 가능 여부 */
  const first = session?.items[0];
  const readyToSubmit = useMemo(
    () => !!(first && answers[first.itemId] != null),
    [first, answers]
  );

  const submit = useCallback(async () => {
    if (!session || submitting || !first || !readyToSubmit) return;
    setSubmitting(true); setErrorText(null);
    try {
      const selectedIdx = answers[first.itemId]!;
      const payload = {
        answers: session.items.map((it) => ({
          itemId: it.itemId,
          // 단일 문항만 선택. 나머지는 0으로 전송(백엔드 허용 전제)
          answerIdx: it.itemId === first.itemId ? selectedIdx : 0,
        })),
      };
      const r = await api.post<SubmitResult>(`/api/quiz/sessions/${session.sessionId}/submit`, payload);
      Alert.alert("결과", `정답 ${r.data.correctCount}/${r.data.total} · +${r.data.awardedPoints}pt`);
      await clearActiveId();
      setSession(null);
      setAnswers({});
      await createSession();
    } catch (e: any) {
      const st = e?.response?.status;
      if (st === 410) { setErrorText("세션이 만료되었습니다(410)."); await clearActiveId(); }
      else if (st === 409) setErrorText("이미 제출된 세션입니다(409).");
      else if (st === 403) setErrorText("세션 권한이 없습니다(403).");
      else if (st === 401) setErrorText("인증 실패(401).");
      else setErrorText(`제출 실패: ${st ?? e?.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [session, first, answers, readyToSubmit, submitting, createSession]);

  /** ===== 로딩/에러 ===== */
  if (loading && !session) {
    return (
      <SafeAreaView style={st.safe}>
        <View style={st.centerFull}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>로딩 중…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={st.safe}>
        <View style={st.heroWrap}>
          {treeImg ? <Image source={treeImg} style={st.hero} resizeMode="contain" /> : <Text style={{ fontSize: 72 }}>🌳</Text>}
        </View>
        <PointsCard />
        <Divider />
        {/* <SectionTitle /> */}
        <View style={st.centerBody}>
          {errorText ? <Text style={st.error}>{errorText}</Text> : <Text>세션이 없습니다.</Text>}
          <TouchableOpacity style={st.button} onPress={createSession}>
            <Text style={st.buttonText}>새 세션 만들기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /** ===== 본문 ===== */
  return (
    <SafeAreaView style={st.safe}>
      <View style={st.heroWrap}>
        {treeImg ? <Image source={treeImg} style={st.hero} resizeMode="contain" /> : <Text style={{ fontSize: 60 }}>🌳</Text>}
      </View>
      <PointsCard />
      <Divider />
      {/* <SectionTitle /> */}  {/* 제목 섹션, 앱 화면 공간 차지를 많이함 */}

      <View style={st.container}>
        {/* 질문 헤더 */}
        <View style={st.qHeader}>
          <Text style={st.qHeaderText}>
            Q. {first?.prompt || "플라스틱 병을 분리배출 할 때\n올바른 방법은?"}
          </Text>
          {/* {bottleImg ? (
            <Image source={bottleImg} style={st.qHeaderIllust} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 44 }}>🧴</Text>
          )} */}
        </View>

        {/* 선택지 (알약형) */}
        <FlatList
          data={first?.choices ?? []}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({ item, index }) => {
            const selected = answers[first!.itemId] === index;
            const label = String.fromCharCode(65 + index);
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                style={[st.pill, selected && st.pillSelected]}
                onPress={() => setAnswers((prev) => ({ ...prev, [first!.itemId]: index }))}
              >
                <View style={[st.pillBadge, selected && st.pillBadgeSelected]}>
                  <Text style={[st.pillBadgeText, selected && { color: "#fff" }]}>{label}</Text>
                </View>
                <Text style={[st.pillText, selected && { color: "#fff" }]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: Platform.select({ ios: 24, android: 16 }) }}
          ListFooterComponent={
            <>
              {errorText ? <Text style={st.error}>{errorText}</Text> : null}
              <TouchableOpacity
                style={[st.cta, (!readyToSubmit || submitting) && { opacity: 0.6 }]}
                onPress={submit}
                disabled={!readyToSubmit || submitting}
              >
                <Text style={st.ctaText}>{submitting ? "제출 중…" : "제출"}</Text>
              </TouchableOpacity>

              {typeof remainSec === "number" && (
                <Text style={st.timer}>
                  만료까지 {Math.floor(remainSec / 60)}:{String(remainSec % 60).padStart(2, "0")}
                </Text>
              )}
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
}

/** ===== 보조 섹션 ===== */
function PointsCard() {
  return (
    <View style={st.pointsCard}>
      <View style={st.pointsLeft}>
        <View style={st.pBadge}><Text style={{ color: "#059669", fontWeight: "700" }}>P</Text></View>
        <Text style={st.pointsText}>0원</Text>
      </View>
      {cartImg ? <Image source={cartImg} style={{ width: 18, height: 18, opacity: 0.85 }} /> : <Text style={{ fontSize: 16 }}>🛒</Text>}
    </View>
  );
}
// function SectionTitle() {
//   return (
//     <View style={st.sectionTitle}>
//       {quizBadgeImg ? (
//         <Image source={quizBadgeImg} style={st.sectionTitleIcon} />
//       ) : (
//         <Text style={st.sectionTitleEmoji}>❓</Text>
//       )}
//       <Text style={st.sectionTitleText}>오늘의 퀴즈</Text>
//     </View>
//   );
// }
function Divider() { return <View style={st.divider} />; }

/** ===== 스타일 ===== */
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },

  centerFull: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  centerBody: { flex: 1, justifyContent: "center", alignItems: "center" },

  heroWrap: { alignItems: "center", paddingTop: 4 },
  hero: { width: 160, height: 160 },  // 트리 이미지 크기

  pointsCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 20, paddingHorizontal: 20, paddingVertical: 15,
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb",
  },
  pointsLeft: { flexDirection: "row", alignItems: "center" },
  pBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginRight: 8 },
  pointsText: { fontSize: 14, color: "#111", fontWeight: "700" },

  divider: { height: 1, backgroundColor: "#e5e7eb", marginHorizontal: 16, marginVertical: 16 },

  container: { flex: 1, paddingHorizontal: 16 },

  /* ---- 섹션 타이틀 ---- */
  sectionTitle: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  sectionTitleIcon: {
    width: 30,
    height: 30,
    marginLeft: 30,     // 왼쪽에서 띄우기
    marginRight: 20,
    // 아이콘을 글자 기준으로 살짝 아래로 내림
    transform: [{ translateY: Platform.select({ ios: 2, android: 3 }) as number }],
  },
  sectionTitleEmoji: {
    marginRight: 20,
    fontSize: 20,
    lineHeight: 22,
    transform: [{ translateY: Platform.select({ ios: 2, android: 3 }) as number }],
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f2937",
    lineHeight: 30,
    marginLeft: -10,  // 아이콘과 겹치도록
  },

  /* ---- 질문 헤더 ---- */
  qHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  qHeaderText: { flex: 1, fontSize: 18, fontWeight: "600", color: "#111827", lineHeight: 30, marginRight: 0 },
  qHeaderIllust: { width: 54, height: 54 },

  /* ---- 선택지 ---- */
  pill: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  pillSelected: { backgroundColor: "#06D16E", borderColor: "#10b981" },
  pillBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0",
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  pillBadgeSelected: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "transparent" },
  pillBadgeText: { fontSize: 12, fontWeight: "800", color: "#10b981" },
  pillText: { fontSize: 15, color: "#000000ff", flexShrink: 1 },

  button: { marginTop: 12, backgroundColor: "#111827", padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  cta: {
    marginTop: 16,
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  timer: { marginTop: 10, textAlign: "center", color: "#6b7280" },

  error: { color: "#d00", marginTop: 8 },
});
