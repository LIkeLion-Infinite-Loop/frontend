// app/quiz/index.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { api } from "../lib/api";

/** ===== 설정 ===== */
const ACTIVE_KEY = "activeQuizSessionId";
const USE_ATTEMPTS_ENDPOINT = false; // 서버 권한 열리기 전까지 OFF

/** ===== 서버 스펙 ===== */
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

/** ===== 이미지 (없으면 이모지 폴백) ===== */
let treeImg: any, bottleImg: any, quizBadgeImg: any, cartImg: any;
try { treeImg = require("../../assets/images/tree_logo.png"); } catch {}
try { bottleImg = require("../../assets/images/bottle.png"); } catch {}
try { quizBadgeImg = require("../../assets/images/quiz-badge.png"); } catch {}
try { cartImg = require("../../assets/images/cart.png"); } catch {}

/** ===== 유틸 ===== */
function secsLeft(iso: string) {
  const end = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((end - now) / 1000));
}
function nowHM() {
  const d = new Date();
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
/** 409에서 sessionId 추출(헤더/바디 방어적 파싱) */
function extractActiveSessionId(ax: AxiosError<any>): number | null {
  const hdr = ax.response?.headers;
  const hdrId =
    (hdr?.["x-active-session-id"] as any) ||
    (hdr?.["X-Active-Session-Id"] as any) ||
    (hdr?.["x-session-id"] as any);
  if (hdrId && !isNaN(Number(hdrId))) return Number(hdrId);

  const data = ax.response?.data;
  if (data?.sessionId && !isNaN(Number(data.sessionId))) return Number(data.sessionId);
  if (data?.error?.sessionId && !isNaN(Number(data.error.sessionId))) {
    return Number(data.error.sessionId);
  }
  try {
    const str = JSON.stringify(data);
    const m = str.match(/"sessionId"\s*:\s*(\d+)/);
    if (m && m[1]) return Number(m[1]);
  } catch {}
  return null;
}
/** AsyncStorage helpers */
async function saveActiveId(id: number) { await AsyncStorage.setItem(ACTIVE_KEY, String(id)); }
async function readActiveId() {
  const raw = await AsyncStorage.getItem(ACTIVE_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return isNaN(n) ? null : n;
}
async function clearActiveId() { await AsyncStorage.removeItem(ACTIVE_KEY); }

/** ===== 컴포넌트 ===== */
export default function QuizScreen() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const [remainSec, setRemainSec] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightCreateRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetState = useCallback(async () => {
    setSession(null);
    setAnswers({});
    setResult(null);
    setErrorText(null);
    setRemainSec(null);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    await clearActiveId();
  }, []);

  const startCountdown = useCallback((expiresAt: string) => {
    if (!expiresAt) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainSec(secsLeft(expiresAt));
    timerRef.current = setInterval(() => {
      setRemainSec((prev) => {
        const v = typeof prev === "number" ? Math.max(prev - 1, 0) : secsLeft(expiresAt);
        if (v <= 0 && timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        return v;
      });
    }, 1000);
  }, []);

  useEffect(() => { if (remainSec === 0) clearActiveId().catch(() => {}); }, [remainSec]);

  const fetchAttemptsLeft = useCallback(async () => {
    if (!USE_ATTEMPTS_ENDPOINT) return; // ← 호출 끔
    try {
      const res = await api.get<{ attemptsLeftToday: number }>(`/api/quiz/attempts/today`);
      if (!mountedRef.current) return;
      setAttemptsLeft(res.data.attemptsLeftToday);
    } catch (e: any) {
      if (__DEV__) console.log("[attempts/today ERR]", e?.response?.status, e?.response?.data);
    }
  }, []);

  const hydrateSession = useCallback(async (s: QuizSession) => {
    setSession(s);
    const init: Record<number, number | null> = {};
    s.items.forEach((it) => (init[it.itemId] = null));
    setAnswers(init);
    if (s.expiresAt) startCountdown(s.expiresAt);
    await saveActiveId(s.sessionId);
    // 세션 응답에 포함된 attemptsLeftToday 우선 사용
    setAttemptsLeft(typeof s.attemptsLeftToday === "number" ? s.attemptsLeftToday : null);
  }, [startCountdown]);

  const fetchSessionById = useCallback(async (sid: number) => {
    try {
      const res = await api.get<QuizSession>(`/api/quiz/sessions/${sid}`);
      if (!mountedRef.current) return;
      await hydrateSession(res.data);
      fetchAttemptsLeft().catch(() => {});
      setErrorText("이미 진행 중인 세션을 이어갑니다.");
    } catch (e) {
      const ax = e as AxiosError<any>;
      const st = ax.response?.status;
      if (st === 410) { setErrorText("세션이 만료되었습니다(410). 새로 시작해주세요."); await clearActiveId(); }
      else if (st === 403) setErrorText("세션 조회 권한이 없습니다(403).");
      else if (st === 404) { setErrorText("활성 세션을 찾을 수 없습니다(404)."); await clearActiveId(); }
      else setErrorText(`활성 세션 조회 실패: ${ax.message}`);
    }
  }, [fetchAttemptsLeft, hydrateSession]);

  const createSession = useCallback(async () => {
    if (inFlightCreateRef.current) return;
    inFlightCreateRef.current = true;
    setLoading(true); setErrorText(null); setResult(null);
    try {
      const res = await api.post<QuizSession>(`/api/quiz/sessions`, {});
      if (!mountedRef.current) return;
      await hydrateSession(res.data);
      fetchAttemptsLeft().catch(() => {});
    } catch (err) {
      const ax = err as AxiosError<any>;
      const status = ax.response?.status;
      const data = ax.response?.data;
      const hdrs = ax.response?.headers;
      console.log("[QUIZ create ERR]", status, data, hdrs);
      if (status === 409) {
        const code = (data?.code || data?.error?.code || data?.error || "").toString();
        if (code.includes("SESSION_ALREADY_ACTIVE")) {
          const sid = extractActiveSessionId(ax);
          if (sid != null) await fetchSessionById(sid);
          else setErrorText("이미 진행 중인 세션이 있어요. 제출/만료 후 다시 시작하거나, 서버 응답에 활성 세션 ID를 포함해 주세요.");
        } else if (code.includes("NOT_ENOUGH_QUESTIONS")) setErrorText("출제 가능한 문항이 부족합니다. (NOT_ENOUGH_QUESTIONS)");
        else if (code.includes("ALREADY_SUBMITTED")) setErrorText("이미 제출된 세션입니다. 새로 생성하세요.");
        else setErrorText(`요청 충돌(409): ${code || "세션 상태를 확인하세요."}`);
      } else if (status === 401) setErrorText("인증 실패(401): 다시 로그인해주세요.");
      else if (status === 403) setErrorText("권한 없음(403): 권한/토큰/역할을 확인해주세요.");
      else if (status === 429) setErrorText("일일 시도 횟수를 초과했습니다. (429 DAILY_LIMIT_REACHED)");
      else setErrorText(`세션 생성 실패: ${ax.message}`);
    } finally {
      if (mountedRef.current) setLoading(false);
      inFlightCreateRef.current = false;
    }
  }, [fetchAttemptsLeft, fetchSessionById, hydrateSession]);

  const boot = useCallback(async () => {
    setLoading(true); setErrorText(null);
    try {
      const savedId = await readActiveId();
      if (savedId != null) { await fetchSessionById(savedId); if (mountedRef.current) setLoading(false); return; }
      await createSession();
    } finally { if (mountedRef.current) setLoading(false); }
  }, [fetchSessionById, createSession]);

  const allAnswered = useMemo(() => {
    if (!session) return false;
    return session.items.every((it) => answers[it.itemId] != null);
  }, [session, answers]);

  const submit = useCallback(async () => {
    if (!session || submitting) return;
    if (!allAnswered) { Alert.alert("알림", "모든 문항에 답을 선택해주세요."); return; }
    setSubmitting(true); setErrorText(null);
    try {
      const payload = {
        answers: session.items.map((it) => ({ itemId: it.itemId, answerIdx: answers[it.itemId]! })),
      };
      const res = await api.post<SubmitResult>(`/api/quiz/sessions/${session.sessionId}/submit`, payload);
      if (!mountedRef.current) return;
      setResult(res.data);
      fetchAttemptsLeft().catch(() => {});
      await clearActiveId();
    } catch (err) {
      const ax = err as AxiosError<any>;
      const status = ax.response?.status;
      const data = ax.response?.data;
      if (status === 401) setErrorText("인증 실패(401): 다시 로그인해주세요.");
      else if (status === 403) setErrorText(`금지(403): ${data?.code || data?.error || "세션 권한을 확인하세요."}`);
      else if (status === 410) { setErrorText("세션이 만료되었습니다(410). 새로 시작해주세요."); await clearActiveId(); }
      else if (status === 409) setErrorText("이미 제출된 세션입니다(409).");
      else setErrorText(`제출 실패: ${ax.message}`);
    } finally { if (mountedRef.current) setSubmitting(false); }
  }, [allAnswered, answers, fetchAttemptsLeft, session, submitting]);

  useEffect(() => { boot(); }, [boot]);

  /** ===== 로딩 ===== */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 8 }}>퀴즈 로딩 중…</Text>
      </View>
    );
  }

  /** ===== 에러(세션 없음) ===== */
  if (errorText && !session && !result) {
    return (
      <View style={styles.wrap}>
        <HeaderBar />
        <Hero />
        <PointsCard />
        <Divider />
        <View style={styles.centerBody}>
          <Text style={styles.error}>{errorText}</Text>
          <TouchableOpacity style={styles.button} onPress={boot}>
            <Text style={styles.buttonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
        <BottomTabs />
      </View>
    );
  }

  /** ===== 세션 없음 ===== */
  if (!session) {
    return (
      <View style={styles.wrap}>
        <HeaderBar />
        <Hero />
        <PointsCard />
        <Divider />
        <View style={styles.centerBody}>
          <Text>세션이 없습니다.</Text>
          <TouchableOpacity style={styles.button} onPress={createSession}>
            <Text style={styles.buttonText}>새 세션 만들기</Text>
          </TouchableOpacity>
        </View>
        <BottomTabs />
      </View>
    );
  }

  /** ===== 결과 화면 ===== */
  if (result) {
    return (
      <View style={styles.wrap}>
        <HeaderBar />
        <Hero />
        <PointsCard />
        <Divider />
        <View style={styles.container}>
          <SectionTitle />
          <View style={styles.quizCard}>
            <Text style={styles.quizTitle}>결과</Text>
            <Text style={{ marginBottom: 12 }}>
              {result.correctCount} / {result.total} 정답 · +{result.awardedPoints}pt
            </Text>

            <FlatList
              data={result.details}
              keyExtractor={(d) => String(d.itemId)}
              renderItem={({ item }) => (
                <Text>• 문제 {item.itemId}: {item.correct ? "정답" : "오답"}</Text>
              )}
            />

            {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

            <View style={{ height: 16 }} />
            <TouchableOpacity
              style={styles.button}
              onPress={async () => { await resetState(); await createSession(); }}
            >
              <Text style={styles.buttonText}>새로 도전하기</Text>
            </TouchableOpacity>

            {(attemptsLeft ?? session.attemptsLeftToday) != null && (
              <Text style={{ marginTop: 8 }}>
                오늘 남은 시도 수: {attemptsLeft ?? session.attemptsLeftToday}
              </Text>
            )}
          </View>
        </View>
        <BottomTabs />
      </View>
    );
  }

  /** ===== 응시 화면 ===== */
  return (
    <View style={styles.wrap}>
      <HeaderBar />
      <Hero />
      <PointsCard />
      <Divider />
      <View style={styles.container}>
        <SectionTitle />
        {/* 질문 헤더 : 텍스트 + 병 일러스트 */}
        <View style={styles.qHeader}>
          <Text style={styles.qHeaderText}>
            Q. {session.items[0]?.prompt || "플라스틱 병을 분리배출 할 때\n올바른 방법은?"}
          </Text>
          {bottleImg ? (
            <Image source={bottleImg} style={styles.qHeaderIllust} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 44 }}>🧴</Text>
          )}
        </View>

        {/* 문제 리스트 (알약형 선택지) */}
        <FlatList
          data={session.items}
          keyExtractor={(it) => String(it.itemId)}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              {item.choices.map((c, idx) => {
                const selectedIdx = answers[item.itemId];
                const selected = selectedIdx === idx;
                const label = String.fromCharCode(65 + idx);
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.85}
                    style={[styles.pill, selected && styles.pillSelected]}
                    onPress={() => setAnswers((prev) => ({ ...prev, [item.itemId]: idx }))}
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
        />

        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

        <TouchableOpacity
          style={[styles.button, (!allAnswered || submitting) && { opacity: 0.6 }]}
          onPress={submit}
          disabled={!allAnswered || submitting}
        >
          <Text style={styles.buttonText}>{submitting ? "제출 중…" : "제출"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonGhost}
          onPress={() => {
            Alert.alert("세션 재시작", "현재 세션을 버리고 새로 시작할까요?", [
              { text: "취소", style: "cancel" },
              { text: "재시작", style: "destructive", onPress: async () => { await resetState(); await createSession(); } },
            ]);
          }}
        >
          <Text style={styles.buttonGhostText}>새 세션 생성</Text>
        </TouchableOpacity>

        {(attemptsLeft ?? session.attemptsLeftToday) != null && (
          <Text style={{ marginTop: 8 }}>
            오늘 남은 시도 수: {attemptsLeft ?? session.attemptsLeftToday}
          </Text>
        )}
      </View>
      <BottomTabs />
    </View>
  );
}

/** ===== 상단/섹션/하단 ===== */
function HeaderBar() {
  return (
    <View style={styles.header}>
      <Text style={styles.time}>{nowHM()}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}
function Hero() {
  return (
    <View style={styles.heroWrap}>
      {treeImg ? <Image source={treeImg} style={styles.hero} resizeMode="contain" /> : <Text style={{ fontSize: 64 }}>🌳</Text>}
    </View>
  );
}
function PointsCard() {
  return (
    <View style={styles.pointsCard}>
      <View style={styles.pointsLeft}>
        <View style={styles.pBadge}><Text style={{ color: "#0ea5e9", fontWeight: "700" }}>P</Text></View>
        <Text style={styles.pointsText}>0원</Text>
      </View>
      {cartImg ? <Image source={cartImg} style={{ width: 18, height: 18, opacity: 0.85 }} /> : <Text style={{ fontSize: 16 }}>🛒</Text>}
    </View>
  );
}
function SectionTitle() {
  return (
    <View style={styles.sectionTitle}>
      {quizBadgeImg ? <Image source={quizBadgeImg} style={{ width: 22, height: 22, marginRight: 8 }} /> : <Text style={{ marginRight: 8, fontSize: 18 }}>❓</Text>}
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#374151" }}>오늘의 퀴즈</Text>
    </View>
  );
}
function BottomTabs() {
  return (
    <View style={styles.nav}>
      {["홈", "기록", "퀴즈", "내 정보"].map((label, idx) => (
        <TouchableOpacity key={idx} style={styles.navItem}>
          <Text style={styles.navText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
function Divider() { return <View style={styles.divider} />; }

/** ===== 스타일 ===== */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    backgroundColor: "#f3f4f6",
  },
  time: { fontSize: 14, fontWeight: "600", color: "#111" },

  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  centerBody: { flex: 1, justifyContent: "center", alignItems: "center" },

  heroWrap: { alignItems: "center", paddingTop: 8 },
  hero: { width: 140, height: 140 },

  pointsCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: "#fff", borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb",
  },
  pointsLeft: { flexDirection: "row", alignItems: "center" },
  pBadge: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: "#e0f2fe",
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  pointsText: { fontSize: 14, color: "#111", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#e5e7eb", marginHorizontal: 16, marginVertical: 16 },

  container: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { flexDirection: "row", alignItems: "center", marginBottom: 12 },

  qHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  qHeaderText: { flex: 1, fontSize: 16, fontWeight: "700", color: "#111", lineHeight: 22, marginRight: 10 },
  qHeaderIllust: { width: 54, height: 54 },

  quizCard: {
    margin: 4, padding: 20, backgroundColor: "#fff", borderRadius: 16,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  quizTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  pill: {
    minHeight: 48, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, borderRadius: 24, backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb", marginBottom: 10,
  },
  pillSelected: { backgroundColor: "#10b981", borderColor: "#10b981" },
  pillBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: "#ecfeff",
    borderWidth: 1, borderColor: "#a7f3d0", alignItems: "center", justifyContent: "center",
    marginRight: 10,
  },
  pillBadgeSelected: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "transparent" },
  pillBadgeText: { fontSize: 12, fontWeight: "700", color: "#10b981" },
  pillText: { fontSize: 14, color: "#111", flexShrink: 1 },

  button: { marginTop: 12, backgroundColor: "#111827", padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  buttonGhost: {
    marginTop: 8, padding: 14, borderRadius: 12, alignItems: "center",
    borderWidth: 1, borderColor: "#ddd", backgroundColor: "#fff",
  },
  buttonGhostText: { color: "#111", fontSize: 16 },

  error: { color: "#d00", marginTop: 8 },

  nav: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd", backgroundColor: "#fff",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, color: "#111", marginTop: 4 },
});
