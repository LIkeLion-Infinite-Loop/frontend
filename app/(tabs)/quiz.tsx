// app/(tabs)/quiz.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Alert, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { api } from "../../lib/api";

/** ===== 서버 타입 ===== */
interface QuizItem { itemId: number; order: number; prompt: string; choices: string[]; }
interface QuizSession {
  sessionId: number; expiresAt: string; numQuestions: number; category: string;
  attemptsLeftToday: number; items: QuizItem[];
}
interface SubmitResult {
  sessionId: number; category: string; correctCount: number; total: number;
  awardedPoints: number; details: { itemId: number; correct: boolean }[]; submittedAt: string;
}

/** ===== 설정/이미지 ===== */
// 지원하는 모든(과거 포함) 저장 키
const ACTIVE_KEYS = ["activeQuizSessionId:shop", "activeQuizSessionId"];
// 기본 사용 키
const ACTIVE_KEY = ACTIVE_KEYS[0];
const ALLOW_CREATE_FALLBACK = true;
let treeImg: any, bottleImg: any, cartImg: any;
try { treeImg = require("../../assets/images/tree_logo.png"); } catch {}
try { bottleImg = require("../../assets/images/bottle.png"); } catch {}
try { cartImg = require("../../assets/images/cart.png"); } catch {}

/** ===== 유틸 ===== */
const secsLeft = (iso: string) => Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
function normalizeSession(raw: any): QuizSession {
  return {
    sessionId: raw?.sessionId ?? raw?.session_id,
    expiresAt: raw?.expiresAt ?? raw?.expires_at,
    numQuestions: raw?.numQuestions ?? raw?.num_questions,
    category: raw?.category,
    attemptsLeftToday: raw?.attemptsLeftToday ?? raw?.attempts_left_today,
    items: (raw?.items ?? []).map((it: any) => ({
      itemId: it?.itemId ?? it?.item_id,
      order: it?.order,
      prompt: it?.prompt,
      choices: it?.choices ?? [],
    })),
  };
}
function extractActiveSessionId(ax: AxiosError<any>): number | null {
  const hdr = ax.response?.headers;
  const byHeader =
    (hdr?.["x-active-session-id"] as any) ??
    (hdr?.["X-Active-Session-Id"] as any) ??
    (hdr?.["x-session-id"] as any);
  if (byHeader && !isNaN(Number(byHeader))) return Number(byHeader);
  const loc = (hdr?.["location"] as string) || (hdr?.["Location"] as string);
  if (loc) { const m = loc.match(/\/sessions\/(\d+)(?:\/)?$/); if (m?.[1]) return Number(m[1]); }
  const data = ax.response?.data;
  for (const v of [data?.sessionId, data?.error?.sessionId, data?.session?.sessionId, data?.data?.sessionId]) {
    const n = Number(v); if (Number.isFinite(n) && n > 0) return n;
  }
  try { const m = JSON.stringify(data).match(/"sessionId"\s*:\s*(\d+)/); if (m?.[1]) return Number(m[1]); } catch {}
  return null;
}
function buildSubmitPayload(session: QuizSession, answers: Record<number, number | null>) {
  const arr = session.items.map((it) => {
    const idx = answers[it.itemId];
    if (idx == null) throw new Error(`미응답 문항: ${it.itemId}`);
    // 서버가 snake/camel 혼용되어도 안전하게 둘 다 보냄
    return { itemId: it.itemId, item_id: it.itemId, answerIdx: idx, answer_idx: idx };
  });
  return { answers: arr };
}
function isExpiredError(e: any) {
  const code = e?.response?.data?.error?.code;
  const msg = e?.response?.data?.error?.message || e?.response?.data?.message;
  return code === "EXPIRED" || msg === "EXPIRED";
}

/** ===== 저장소 ===== */
const saveActiveId = async (id: number) => {
  // 현재 키와 레거시 키 모두에 저장(호환)
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

/** ===== 메인 ===== */
export default function QuizScreen() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [remainSec, setRemainSec] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [curIdx, setCurIdx] = useState(0);
  const inFlightRef = useRef(false);

  const softExpired = useMemo(
    () => typeof remainSec === "number" && remainSec <= 0,
    [remainSec]
  );
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  const startCountdown = useCallback((expiresAt: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainSec(secsLeft(expiresAt));
    timerRef.current = setInterval(() => {
      setRemainSec((prev) => (typeof prev === "number" ? Math.max(prev - 1, 0) : secsLeft(expiresAt)));
    }, 1000);
  }, []);

  const hydrate = useCallback(async (raw: any) => {
    const s = normalizeSession(raw);
    setSession(s);
    const map: Record<number, number | null> = {};
    s.items.forEach((it) => (map[it.itemId] = null));
    setAnswers(map);
    setCurIdx(0);
    if (s.expiresAt) startCountdown(s.expiresAt);
    await saveActiveId(s.sessionId);
    setErrorText(null);
  }, [startCountdown]);

  const fetchById = useCallback(async (sid: number) => {
    try { const r = await api.get(`/api/quiz/sessions/${sid}`); await hydrate(r.data); return true; }
    catch (e: any) {
      const st = e?.response?.status;
      if (st === 410 || st === 404) await clearActiveId();
      setErrorText(st === 410 ? "세션이 만료되었습니다(410)." : "세션을 불러올 수 없습니다.");
      return false;
    }
  }, [hydrate]);

  /** 서버 활성 세션 이어받기 */
  const resumeFromActive = useCallback(async () => {
    try {
      const r = await api.get(`/api/quiz/sessions/active`);
      const data = r.data ?? {};

      // 관대한 파싱: 여러 응답 형태 허용
      let sid: number | null = null;
      if (data.sessionId || data.session_id) {
        sid = Number(data.sessionId ?? data.session_id);
      } else if (data.session && (data.session.sessionId || data.session.session_id)) {
        sid = Number(data.session.sessionId ?? data.session.session_id);
      }

      if (Number.isFinite(sid)) {
        return await fetchById(sid as number);
      }

      const has = data.hasActive ?? data.has_active;
      if (has === false) return false; // 명시적 비활성

      setErrorText("서버의 /active 응답에 활성 세션 정보가 없습니다.");
      return false;
    } catch (e: any) {
      const st = e?.response?.status;
      if (st === 401) setErrorText("로그인이 필요합니다(401).");
      else setErrorText(`활성 세션 조회 실패(/active): ${st ?? e?.message}`);
      return false;
    }
  }, [fetchById]);

  const createSession = useCallback(async () => {
    setLoading(true); setErrorText(null);
    try {
      const r = await api.post(`/api/quiz/sessions`, {});
      await hydrate(r.data);
      return true;
    } catch (e: any) {
      const st = e?.response?.status;
      if (st === 409) {
        // 이미 활성 세션이 있으면 ID를 추출해 이어받기 시도
        const sid = extractActiveSessionId(e as AxiosError<any>);
        if (sid && await fetchById(sid)) return true;
        // /active로 한 번 더 시도
        if (await resumeFromActive()) return true;
        setErrorText("이미 진행 중인 세션이 있어요. 이어받기를 시도해주세요.");
      } else if (st === 401) setErrorText("인증이 필요합니다(401).");
      else if (st === 403) setErrorText("접근이 거부되었습니다(403).");
      else if (st === 429) setErrorText("일일 시도 한도를 초과했습니다(429).");
      else setErrorText(`세션 생성 실패: ${st ?? e?.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [hydrate, fetchById, resumeFromActive]);

  /** 저장된 id 또는 /active로만 이어붙이기 (새로 만들지 않음, 옵션에 따라 새로 생성) */
  const resume = useCallback(async () => {
    if (inFlightRef.current) return false;
    inFlightRef.current = true;
    setLoading(true);
    setErrorText(null);
    try {
      const saved = await readActiveId();
      if (saved && await fetchById(saved)) return true;
      if (await resumeFromActive()) return true;

      if (!ALLOW_CREATE_FALLBACK) {
        setErrorText("이어받을 활성 세션이 없습니다.");
        return false;
      }
      return await createSession();
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [fetchById, resumeFromActive, createSession]);

  /** 부팅: 이어받기만 시도, 옵션에 따라 새로 생성 */
  const boot = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setErrorText(null);
    try {
      const saved = await readActiveId();
      if (saved && await fetchById(saved)) return;
      if (await resumeFromActive()) return;

      if (ALLOW_CREATE_FALLBACK) {
        await createSession();
        return;
      }
      setErrorText("이어받을 활성 세션이 없습니다. (부팅 시)");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [fetchById, resumeFromActive, createSession]);

  useEffect(() => { boot(); }, [boot]);

  /** 진행/제출 로직 */
  const allAnswered = useMemo(() => {
    if (!session) return false;
    return session.items.every((it) => answers[it.itemId] != null);
  }, [session, answers]);
  const current = session?.items[curIdx];

  const onSelect = (itemId: number, idx: number) => {
    if (softExpired) return; // 만료되면 선택 불가
    setAnswers((prev) => ({ ...prev, [itemId]: idx }));
    if (session && curIdx < session.items.length - 1) setCurIdx((i) => i + 1);
  };

  const submit = useCallback(async () => {
    if (!session || submitting) return;
    if (!allAnswered) {
      Alert.alert("알림", "모든 문항(3개)에 답을 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setErrorText(null);
    try {
      const payload = buildSubmitPayload(session, answers);
      const r = await api.post<SubmitResult>(
        `/api/quiz/sessions/${session.sessionId}/submit`,
        payload
      );

      Alert.alert(
        "결과",
        `정답 ${r.data.correctCount}/${r.data.total} · +${r.data.awardedPoints}pt`
      );

      await clearActiveId();
      setSession(null);
      setAnswers({});
      // ❌ 새 세션 자동 생성 없음
    } catch (e: any) {
      const st = e?.response?.status;

      if (!st) {
        setErrorText(e.message || "제출 중 오류");
      } else if (
        st === 410 ||
        (st === 400 && isExpiredError(e)) ||
        (st === 409 && isExpiredError(e))
      ) {
        // 만료 시 새 시작 금지: 알림만
        setErrorText("세션이 만료되었습니다. 진행 중 세션에서만 제출할 수 있어요.");
        await clearActiveId();
        return;
      } else if (st === 409) {
        setErrorText("이미 제출된 세션입니다(409).");
      } else if (st === 403) {
        setErrorText("세션 권한이 없습니다(403).");
      } else if (st === 401) {
        setErrorText("인증 실패(401).");
      } else if (st === 400) {
        setErrorText("요청 형식 오류(400): 모든 문항 답이 포함되어 있는지 확인하세요.");
      } else {
        setErrorText(`제출 실패: ${st ?? e?.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  }, [session, answers, allAnswered, submitting]);

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
        <Divider />
        <View style={st.centerBody}>
          {errorText ? <Text style={st.error}>{errorText}</Text> : <Text>세션이 없습니다.</Text>}
          <TouchableOpacity style={st.button} onPress={resume}>
            <Text style={st.buttonText}>세션 이어받기</Text>
          </TouchableOpacity>

          {ALLOW_CREATE_FALLBACK && (
            <TouchableOpacity
              style={[st.button, { backgroundColor: "#374151", marginTop: 8 }]}
              onPress={createSession}
            >
              <Text style={st.buttonText}>새 세션 시작</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[st.button, { backgroundColor: "#111827", marginTop: 8 }]}
            onPress={async () => {
              const saved = await readActiveId();
              try {
                const r = await api.get(`/api/quiz/sessions/active`);
                Alert.alert("진단", `savedId=${saved ?? "null"}\n/active=${JSON.stringify(r.data)}`);
              } catch (e: any) {
                const st = e?.response?.status;
                Alert.alert("진단", `savedId=${saved ?? "null"}\n/active error=${st ?? e?.message}`);
              }
            }}
          >
            <Text style={st.buttonText}>진단 로그 출력</Text>
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
      <Divider />

      <View style={st.container}>
        {softExpired && (
          <View style={{ padding: 12, backgroundColor: "#FEF2F2", borderRadius: 8, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#fecaca" }}>
            <Text style={{ color: "#991B1B", fontWeight: "700", marginBottom: 8 }}>세션이 만료되었습니다</Text>
            <TouchableOpacity
              onPress={async () => { await resume(); }}
              style={{ backgroundColor: "#111827", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>세션 이어받기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 질문 헤더 */}
        <View style={st.qHeader}>
          <Text style={st.qHeaderText}>
            Q. {session.items[curIdx]?.prompt || "플라스틱 병을 분리배출 할 때\n올바른 방법은?"}
          </Text>
        </View>

        {/* 선택지 */}
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
                  style={[st.pill, selected && st.pillSelected]}
                  onPress={() => onSelect(item.itemId, idx)}
                  disabled={softExpired}
                >
                  <View style={[st.pillBadge, selected && st.pillBadgeSelected]}>
                    <Text style={[st.pillBadgeText, selected && { color: "#fff" }]}>{label}</Text>
                  </View>
                  <Text style={[st.pillText, selected && { color: "#fff" }]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 진행/네비게이션 */}
        <Text style={st.progressText}>
          {curIdx + 1} / {session.items.length}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          <TouchableOpacity
            disabled={curIdx === 0 || softExpired}
            style={[st.navBtn, (curIdx === 0 || softExpired) && { opacity: 0.5 }]}
            onPress={() => setCurIdx((i) => Math.max(0, i - 1))}
          >
            <Text style={st.navBtnText}>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={curIdx === session.items.length - 1 || softExpired}
            style={[st.navBtn, (curIdx === session.items.length - 1 || softExpired) && { opacity: 0.5 }]}
            onPress={() => setCurIdx((i) => Math.min(session.items.length - 1, i + 1))}
          >
            <Text style={st.navBtnText}>다음</Text>
          </TouchableOpacity>
        </View>

        {/* 에러 */}
        {errorText ? <Text style={st.error}>{errorText}</Text> : null}

        {/* 제출 */}
        <TouchableOpacity
          style={[st.cta, (!allAnswered || submitting) && { opacity: 0.6 }]}
          onPress={submit}
          disabled={!allAnswered || submitting}
        >
          <Text style={st.ctaText}>{submitting ? "제출 중…" : "제출"}</Text>
        </TouchableOpacity>

        {/* 타이머 */}
        {typeof remainSec === "number" && (
          <Text style={st.timer}>
            만료까지 {Math.floor(remainSec / 60)}:{String(remainSec % 60).padStart(2, "0")}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function Divider() { return <View style={st.divider} />; }

/** ===== 스타일 ===== */
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  centerFull: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  centerBody: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroWrap: { alignItems: "center", paddingTop: 4 },
  hero: { width: 160, height: 160 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginHorizontal: 16, marginVertical: 16 },
  container: { flex: 1, paddingHorizontal: 16 },

  qHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  qHeaderText: { flex: 1, fontSize: 18, fontWeight: "600", color: "#111827", lineHeight: 28, marginRight: 0 },

  pill: {
    minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    borderRadius: 28, backgroundColor: "#fff", borderWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  pillSelected: { backgroundColor: "#06D16E", borderColor: "#10b981" },
  pillBadge: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0",
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  pillBadgeSelected: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "transparent" },
  pillBadgeText: { fontSize: 12, fontWeight: "800", color: "#10b981" },
  pillText: { fontSize: 15, color: "#000000ff", flexShrink: 1 },

  button: { marginTop: 12, backgroundColor: "#111827", padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  navBtn: {
    backgroundColor: "#fff", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb", minWidth: 100, alignItems: "center",
  },
  navBtnText: { color: "#111", fontSize: 16, fontWeight: "600" },

  cta: { marginTop: 16, backgroundColor: "#111827", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  progressText: { marginTop: 8, textAlign: "center", color: "#4b5563" },
  timer: { marginTop: 10, textAlign: "center", color: "#6b7280" },
  error: { color: "#d00", marginTop: 8 },
});