// app/quiz/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { AxiosError } from "axios";
import { api } from "../lib/api";

/** ====== 서버 스펙 인터페이스 ====== */
interface QuizItem {
  itemId: number;
  order: number;
  prompt: string;
  choices: string[];
}
interface QuizSession {
  sessionId: number;
  expiresAt: string;
  numQuestions: number; // 항상 3
  category: string;     // 서버가 셔플/선정
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

export default function QuizScreen() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const resetState = () => {
    setSession(null);
    setAnswers({});
    setResult(null);
    setErrorText(null);
  };

  const fetchAttemptsLeft = async () => {
    try {
      const res = await api.get<{ attemptsLeftToday: number }>(
        `/api/quiz/attempts/today`
      );
      setAttemptsLeft(res.data.attemptsLeftToday);
    } catch {
      // 옵션 정보이므로 무시
    }
  };

  const createSession = async () => {
    setLoading(true);
    setErrorText(null);
    setResult(null);
    try {
      // 스펙상 category는 서버가 결정. 바디가 없어도 됨.
      const res = await api.post<QuizSession>(`/api/quiz/sessions`, {});
      setSession(res.data);

      // 초기 답안 상태 세팅
      const init: Record<number, number | null> = {};
      res.data.items.forEach((it) => (init[it.itemId] = null));
      setAnswers(init);

      fetchAttemptsLeft();
    } catch (err) {
      const ax = err as AxiosError<any>;
      const status = ax.response?.status;
      const data = ax.response?.data;

      if (status === 401) {
        setErrorText("인증 실패(401): 다시 로그인해주세요.");
      } else if (status === 403) {
        setErrorText(
          `권한 없음(403): ${data?.code || data?.error || "권한이 부족합니다."}`
        );
      } else if (status === 409) {
        const code = (data?.code || data?.error || "").toString();
        if (code.includes("SESSION_ALREADY_ACTIVE")) {
          setErrorText("이미 활성 세션이 있습니다. 제출 또는 만료 후 다시 생성하세요.");
        } else if (code.includes("NOT_ENOUGH_QUESTIONS")) {
          setErrorText("출제 가능한 문항이 부족합니다. (NOT_ENOUGH_QUESTIONS)");
        } else if (code.includes("ALREADY_SUBMITTED")) {
          setErrorText("이미 제출된 세션입니다. 새로 생성하세요.");
        } else {
          setErrorText(`요청 충돌(409): ${code || "세션 상태를 확인하세요."}`);
        }
      } else if (status === 429) {
        setErrorText("일일 시도 횟수를 초과했습니다. (429 DAILY_LIMIT_REACHED)");
      } else {
        setErrorText(`세션 생성 실패: ${ax.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!session) return;

    // 모든 문항이 선택되었는지 체크
    for (const it of session.items) {
      const idx = answers[it.itemId];
      if (idx == null) {
        Alert.alert("알림", "모든 문항에 답을 선택해주세요.");
        return;
      }
    }

    setSubmitting(true);
    setErrorText(null);
    try {
      const payload = {
        answers: session.items.map((it) => ({
          itemId: it.itemId,
          answerIdx: answers[it.itemId]!, // 0-based index
        })),
      };
      const res = await api.post<SubmitResult>(
        `/api/quiz/sessions/${session.sessionId}/submit`,
        payload
      );
      setResult(res.data);
      fetchAttemptsLeft();
    } catch (err) {
      const ax = err as AxiosError<any>;
      const status = ax.response?.status;
      const data = ax.response?.data;

      if (status === 401) {
        setErrorText("인증 실패(401): 다시 로그인해주세요.");
      } else if (status === 403) {
        setErrorText(
          `금지(403): ${data?.code || data?.error || "세션 권한을 확인하세요."}`
        );
      } else if (status === 410) {
        setErrorText("세션이 만료되었습니다(410). 새로 시작해주세요.");
      } else if (status === 409) {
        setErrorText("이미 제출된 세션입니다(409).");
      } else {
        setErrorText(`제출 실패: ${ax.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    createSession();
  }, []);

  /** ---------- UI ---------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 8 }}>퀴즈 로딩 중…</Text>
      </View>
    );
  }

  if (errorText && !session && !result) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{errorText}</Text>
        <TouchableOpacity style={styles.button} onPress={createSession}>
          <Text style={styles.buttonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text>세션이 없습니다.</Text>
        <TouchableOpacity style={styles.button} onPress={createSession}>
          <Text style={styles.buttonText}>새 세션 만들기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result) {
    // 제출 결과 화면
    return (
      <View style={styles.container}>
        <Text style={styles.title}>결과</Text>
        <Text style={{ marginBottom: 8 }}>
          {result.correctCount} / {result.total} 정답 · +{result.awardedPoints}pt
        </Text>

        <FlatList
          data={result.details}
          keyExtractor={(d) => String(d.itemId)}
          renderItem={({ item }) => (
            <Text>
              • 문제 {item.itemId}: {item.correct ? "정답" : "오답"}
            </Text>
          )}
        />

        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

        <View style={{ height: 16 }} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            resetState();
            createSession();
          }}
        >
          <Text style={styles.buttonText}>새로 도전하기</Text>
        </TouchableOpacity>

        {attemptsLeft != null && (
          <Text style={{ marginTop: 8 }}>오늘 남은 시도 수: {attemptsLeft}</Text>
        )}
      </View>
    );
  }

  // 응시 화면
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        카테고리: {session.category} · 오늘 남은 시도: {session.attemptsLeftToday}
      </Text>

      <FlatList
        data={session.items}
        keyExtractor={(it) => String(it.itemId)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.q}>
              {item.order}. {item.prompt}
            </Text>

            {item.choices.map((c, idx) => {
              const selectedIdx = answers[item.itemId];
              const selected = selectedIdx === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.choice, selected && styles.choiceSelected]}
                  onPress={() =>
                    setAnswers((prev) => ({ ...prev, [item.itemId]: idx }))
                  }
                >
                  <Text style={{ color: selected ? "#fff" : "#222" }}>
                    {idx + 1}. {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />

      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

      <TouchableOpacity
        style={[styles.button, submitting && { opacity: 0.6 }]}
        onPress={submit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? "제출 중…" : "제출"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonGhost]}
        onPress={() => {
          Alert.alert("세션 재시작", "현재 세션을 버리고 새로 시작할까요?", [
            { text: "취소", style: "cancel" },
            {
              text: "재시작",
              style: "destructive",
              onPress: () => {
                resetState();
                createSession();
              },
            },
          ]);
        }}
      >
        <Text style={styles.buttonGhostText}>새 세션 생성</Text>
      </TouchableOpacity>

      {attemptsLeft != null && (
        <Text style={{ marginTop: 8 }}>오늘 남은 시도 수: {attemptsLeft}</Text>
      )}
    </View>
  );
}

/** ====== 스타일 ====== */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  q: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  choice: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginTop: 8,
  },
  choiceSelected: { backgroundColor: "#007AFF" },
  button: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  buttonGhost: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonGhostText: { color: "#111", fontSize: 16 },
  error: { color: "#d00", marginTop: 8 },
});
