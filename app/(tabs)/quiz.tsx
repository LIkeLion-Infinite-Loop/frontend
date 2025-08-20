import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";

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

export default function QuizScreen() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const accessToken = "YOUR_ACCESS_TOKEN";

  /** 세션 생성 */
  const createSession = async () => {
    try {
      setLoading(true);
      const res = await axios.post<QuizSession>(
        "https://example.com/api/quiz/sessions",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSession(res.data);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("세션 생성 실패", err.response?.data?.message || "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  /** 세션 제출 */
  const submitSession = async () => {
    if (!session) return;
    const payload = {
      answers: Object.entries(answers).map(([itemId, answerIdx]) => ({
        itemId: Number(itemId),
        answerIdx: answerIdx,
      })),
    };

    try {
      const res = await axios.post(
        `https://example.com/api/quiz/sessions/${session.sessionId}/submit`,
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      Alert.alert(
        "결과",
        `맞힌 개수: ${res.data.correctCount}/${res.data.total}\n적립 포인트: ${res.data.awardedPoints}`
      );
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("제출 실패", err.response?.data?.message || "알 수 없는 오류");
    }
  };

  useEffect(() => {
    createSession();
  }, []);

  if (loading) return <Text>불러오는 중...</Text>;
  if (!session) return <Text>세션 없음</Text>;

  const currentItem = session.items[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>
        Q{currentIndex + 1}. {currentItem.prompt}
      </Text>

      {currentItem.choices.map((choice, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.choiceBtn,
            answers[currentItem.itemId] === idx && styles.choiceSelected,
          ]}
          onPress={() =>
            setAnswers({ ...answers, [currentItem.itemId]: idx })
          }
        >
          <Text style={styles.choiceText}>
            {String.fromCharCode(65 + idx)}. {choice}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.navBtnWrapper}>
        {currentIndex < session.items.length - 1 ? (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setCurrentIndex((prev) => prev + 1)}
          >
            <Text>다음</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navBtn} onPress={submitSession}>
            <Text>제출</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  prompt: { fontSize: 18, marginBottom: 20 },
  choiceBtn: {
    backgroundColor: "#f4f4f4",
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
  },
  choiceSelected: { backgroundColor: "#d6f5d6" },
  choiceText: { fontSize: 16 },
  navBtnWrapper: { marginTop: 20, alignItems: "flex-end" },
  navBtn: {
    backgroundColor: "#e6e6e6",
    padding: 10,
    borderRadius: 8,
  },
});
