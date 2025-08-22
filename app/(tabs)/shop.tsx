// app/(tabs)/shop.native.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
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
  expiresAt: string; // ISO UTC
  numQuestions: number; // 항상 3
  category: string;
  attemptsLeftToday: number; // 생성 응답 시 포함
  items: QuizItem[];
}
type AnyObj = Record<string, any>;

/** ===== 유틸 ===== */
const str = (x: any) => {
  if (x == null) return "";
  if (typeof x === "string") return x;
  try {
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
};
function formatErr(data: AnyObj | undefined) {
  const rawCode =
    data?.error?.code ??
    data?.code ??
    data?.errorCode ??
    data?.name ??
    null;
  const rawMsg =
    data?.error?.message ??
    data?.message ??
    data?.errorMessage ??
    null;

  const code = typeof rawCode === "string" ? rawCode : str(rawCode);
  const message = typeof rawMsg === "string" ? rawMsg : str(rawMsg);

  return { code, message };
}
function extractSessionId(data: AnyObj | undefined): number | null {
  if (!data) return null;
  const candidates = [
    data.sessionId,
    data.session_id,
    data?.session?.sessionId,
    data?.session?.id,
    data?.data?.sessionId,
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
async function getAttemptsLeft(): Promise<number | null> {
  try {
    const r = await api.get<{ attemptsLeftToday: number }>(
      "/api/quiz/attempts/today"
    );
    return r.data.attemptsLeftToday ?? null;
  } catch {
    return null;
  }
}
/** 활성 세션 요약 → 상세로 복구 */
async function tryFetchActiveFull(): Promise<QuizSession | null> {
  try {
    const r = await api.get<{ hasActive: boolean; session?: { sessionId: number } }>(
      "/api/quiz/sessions/active"
    );
    if (!r.data?.hasActive || !r.data?.session?.sessionId) return null;
    const sid = r.data.session.sessionId;
    // 상세(문항 포함) 재조회 — 서버가 이 엔드포인트를 제공해야 새로고침 후 화면 복구 가능
    const full = await api.get<QuizSession>(`/api/quiz/sessions/${sid}`);
    return full.data;
  } catch (e: any) {
    // 403/404면 서버 정책상 비허용
    return null;
  }
}

/** ===== 메인 컴포넌트 ===== */
export default function ShopQuiz() {
  const [quiz, setQuiz] = useState<QuizSession | null>(null);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null); // answerIdx 저장
  const [feedback, setFeedback] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastErrorDetail, setLastErrorDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  // 만료 카운트다운
  const [now, setNow] = useState<number>(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiresAtMs = useMemo(
    () => (quiz?.expiresAt ? Date.parse(quiz.expiresAt) : null),
    [quiz?.expiresAt]
  );
  const remainingMs = useMemo(
    () => (expiresAtMs ? Math.max(0, expiresAtMs - now) : null),
    [expiresAtMs, now]
  );
  const remainingText = useMemo(() => {
    if (remainingMs == null) return "";
    const s = Math.floor(remainingMs / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }, [remainingMs]);

  useEffect(() => {
    if (quiz?.expiresAt) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = setInterval(() => setNow(Date.now()), 1000);
      return () => {
        if (tickRef.current) clearInterval(tickRef.current);
      };
    }
  }, [quiz?.expiresAt]);

  useEffect(() => {
    if (remainingMs === 0 && quiz) {
      // 만료 처리
      setFeedback(null);
      setSelected(null);
      setErr("세션이 만료되었습니다(410). 새로 시작해주세요.");
      setQuiz(null);
    }
  }, [remainingMs, quiz]);

  const loadAttempts = async () => {
    const left = await getAttemptsLeft();
    if (left != null) setAttemptsLeft(left);
  };

  const createSession = async () => {
    setErr(null);
    setLastErrorDetail(null);
    setLoading(true);
    try {
      // 빈 바디로 생성 (서버가 카테고리/문항 선택)
      const res = await api.post<QuizSession>("/api/quiz/sessions", {});
      setQuiz(res.data);
      setI(0);
      setSelected(null);
      setFeedback(null);
      setAttemptsLeft(res.data.attemptsLeftToday ?? null);
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const { code, message } = formatErr(data);

      setLastErrorDetail(
        `status=${status}, code=${code || "N/A"}, message=${message || "N/A"}, body=${str(
          data
        )}`
      );

      if (status === 409) {
        // 이미 활성 세션 → 이어받기 시도
        const activeFull = await tryFetchActiveFull();
        if (activeFull) {
          setQuiz(activeFull);
          setI(0);
          setSelected(null);
          setFeedback(null);
          setErr(null);
          await loadAttempts();
          setLoading(false);
          return;
        }
        // 409 바디에서 sessionId 제공 시 직접 재조회 (서버가 넣어줄 수 있음)
        const sid = extractSessionId(data);
        if (sid) {
          try {
            const full = await api.get<QuizSession>(`/api/quiz/sessions/${sid}`);
            setQuiz(full.data);
            setI(0);
            setSelected(null);
            setFeedback(null);
            setErr(null);
            await loadAttempts();
            setLoading(false);
            return;
          } catch {
            // 무시 → 안내로 진행
          }
        }
        setErr(
          code?.includes("SESSION_ALREADY_ACTIVE")
            ? "이미 진행 중인 세션이 있어요. 제출/만료 후 다시 시작하거나, 서버에서 활성 세션 상세 조회를 허용해 주세요."
            : `요청 충돌(409): ${code || "세션 상태를 확인하세요."}`
        );
      } else if (status === 429) {
        setErr("일일 시도 한도를 초과했습니다. (429)");
      } else if (status === 401) {
        setErr("인증이 필요합니다. 다시 로그인해주세요. (401)");
      } else if (status === 403) {
        setErr(`접근이 거부되었습니다. (403${code ? ` ${code}` : ""})`);
      } else {
        setErr(`퀴즈를 불러오지 못했습니다. (${status ?? "네트워크 오류"})`);
      }
      await loadAttempts();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createSession();
  }, []);

  /** 제출 */
  const submit = async () => {
    if (!quiz) return;
    if (selected == null) return;

    try {
      const payload = {
        answers: quiz.items.map((it) => ({
          itemId: it.itemId,
          answerIdx: it.itemId === quiz.items[i].itemId ? selected : 0, // 선택한 문항만 selected, 나머진 임시 0 예시
        })),
      };
      const r = await api.post(`/api/quiz/sessions/${quiz.sessionId}/submit`, payload);
      Alert.alert(
        "결과",
        `정답 ${r.data.correctCount}/${r.data.total} · +${r.data.awardedPoints}pt`
      );
      // 제출 성공 → 새로 생성하도록 초기화
      setQuiz(null);
      setSelected(null);
      setFeedback(null);
      await loadAttempts();
      await createSession();
    } catch (e: any) {
      const st = e?.response?.status;
      const data = e?.response?.data;
      const { code, message } = formatErr(data);

      if (st === 410) {
        setErr("세션이 만료되었습니다(410). 새로 시작해주세요.");
        setQuiz(null);
      } else if (st === 409) {
        setErr(
          code?.includes("ALREADY_SUBMITTED")
            ? "이미 제출된 세션입니다(409). 새로 시작해주세요."
            : `요청 충돌(409): ${code || "세션 상태를 확인하세요."}`
        );
        setQuiz(null);
      } else if (st === 403) {
        setErr("다른 사용자의 세션입니다(403).");
      } else if (st === 400) {
        setErr("제출 형식 오류(400).");
      } else if (st === 401) {
        setErr("인증이 필요합니다(401).");
      } else {
        setErr(`제출 실패: ${st ?? e?.message}`);
      }
    }
  };

  /** UI 상태 분기 */
  if (loading && !quiz) {
    return (
      <View style={s.box}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>로딩 중…</Text>
      </View>
    );
  }

  if (err && !quiz) {
    return (
      <View style={s.box}>
        <Text style={s.errTxt}>{err}</Text>
        {!!lastErrorDetail && <Text style={s.hint}>디버그: {lastErrorDetail}</Text>}
        <Pressable style={s.btn} onPress={createSession}>
          <Text style={s.btnTxt}>새 세션 만들기</Text>
        </Pressable>
        {attemptsLeft != null && (
          <Text style={{ marginTop: 8 }}>오늘 남은 시도 수: {attemptsLeft}</Text>
        )}
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={s.box}>
        <Text>세션이 없습니다.</Text>
        <Pressable style={s.btn} onPress={createSession}>
          <Text style={s.btnTxt}>새 세션 만들기</Text>
        </Pressable>
        {attemptsLeft != null && (
          <Text style={{ marginTop: 8 }}>오늘 남은 시도 수: {attemptsLeft}</Text>
        )}
      </View>
    );
  }

  const cur = quiz.items[i];

  return (
    <View style={s.container}>
      <Text style={s.title}>
        카테고리: {quiz.category} · 남은 시도: {quiz.attemptsLeftToday}
      </Text>
      {!!remainingText && <Text style={s.timer}>만료까지: {remainingText}</Text>}

      <Text style={s.prompt}>
        {cur.order}. {cur.prompt}
      </Text>

      <View>
        {cur.choices.map((c, idx) => {
          const selectedNow = selected === idx;
          return (
            <Pressable
              key={idx}
              onPress={() => setSelected(idx)}
              style={[s.choice, selectedNow && s.choiceSel]}
            >
              <Text style={{ color: selectedNow ? "#fff" : "#111" }}>
                {idx + 1}. {c}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!feedback ? (
        <Pressable
          style={[s.btn, selected == null && { opacity: 0.6 }]}
          onPress={submit}
          disabled={selected == null}
        >
          <Text style={s.btnTxt}>제출</Text>
        </Pressable>
      ) : (
        <View style={{ marginTop: 12 }}>
          <Text>{feedback}</Text>
          <Pressable style={s.btn} onPress={() => setFeedback(null)}>
            <Text style={s.btnTxt}>다음</Text>
          </Pressable>
        </View>
      )}

      {!!err && (
        <View style={{ marginTop: 10 }}>
          <Text style={s.errTxt}>{err}</Text>
          {!!lastErrorDetail && <Text style={s.hint}>디버그: {lastErrorDetail}</Text>}
        </View>
      )}
    </View>
  );
}

/** ===== 스타일 ===== */
const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  box: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  timer: { color: "#007AFF", marginBottom: 8 },
  prompt: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  choice: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginTop: 8,
  },
  choiceSel: { backgroundColor: "#007AFF" },
  btn: {
    marginTop: 12,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "600" },
  errTxt: { color: "#d00", textAlign: "center" },
  hint: { marginTop: 6, fontSize: 12, color: "#666", textAlign: "center" },
});
