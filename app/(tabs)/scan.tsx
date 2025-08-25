import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image as RNImage,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { api } from '@/lib/api';

const GUIDE = { topPct: 0.2, sidePct: 0.1, heightPct: 0.6 };


// ✅ 서버 응답(정답 제출) 새 스키마 대응
interface AnswerResult {
  sessionId?: number;
  itemId: number;
  correct: boolean;
  correctIndex?: number; // correct_index
  awardedPoints: number; // awarded_points
  totalAwardedPoints?: number; // total_awarded_points
  answeredCount?: number; // 선택: 서버가 주면 사용
  total: number;
  completed: boolean; // finished
  nextItemOrder?: number; // next_item_order
  explanation?: string; // 해설
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
    order: it?.order,
    prompt: it?.prompt,
    choices: it?.choices ?? [],
  })),
});

// ✅ 새 응답 스키마 정상화
const normalizeAnswer = (raw: any): AnswerResult => ({
  sessionId: raw?.sessionId ?? raw?.session_id,
  itemId: raw?.itemId ?? raw?.item_id,
  correct: !!raw?.correct,
  correctIndex: raw?.correctIndex ?? raw?.correct_index,
  awardedPoints: raw?.awardedPoints ?? raw?.awarded_points ?? 0,
  totalAwardedPoints: raw?.totalAwardedPoints ?? raw?.total_awarded_points,
  answeredCount: raw?.answeredCount ?? raw?.answered_count, // 없을 수도 있음
  total: raw?.total ?? 3,
  completed: !!(raw?.completed ?? raw?.finished),
  nextItemOrder: raw?.nextItemOrder ?? raw?.next_item_order,
  explanation: raw?.explanation,
  submittedAt: raw?.submittedAt ?? raw?.submitted_at,
});

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
  for (const v of [
    data?.sessionId,
    data?.error?.sessionId,
    data?.session?.sessionId,
    data?.data?.sessionId,
  ]) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  try {
    const m = JSON.stringify(data).match(/"sessionId"\s*:\s*(\d+)/);
    if (m?.[1]) return Number(m[1]);
  } catch {}
  return null;
}

  /** RN uri -> Blob (axios formdata 타입오류 회피) */
  const uriToBlob = async (uri: string) => {
    const res = await fetch(uri);
    return await res.blob();
  };

  /** 서버가 1MB 제한 → 적당히 리사이즈/압축 */
  const shrinkToUnder1MB = async (uri: string) => {
    let currentUri = uri;
    let quality = 0.8;

    for (let i = 0; i < 4; i++) {
      const blob = await uriToBlob(currentUri);
      if (blob.size <= 1024 * 1024) return { uri: currentUri, size: blob.size };

      // 크면 축소
      const manipulated = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width: 1280 } }], // 길이 기준 축소
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );
      currentUri = manipulated.uri;
      quality = Math.max(0.4, quality - 0.15);
    }

    const finalBlob = await uriToBlob(currentUri);
    return { uri: currentUri, size: finalBlob.size };
  };

  /** PARSED 될 때까지 폴링 */
  const waitUntilParsed = async (receiptId: number, maxMs = 20000, stepMs = 1200) => {
    const started = Date.now();
    while (Date.now() - started < maxMs) {
      const s = await api.get(`/api/receipts/${receiptId}/status`);
      const status = String(s.data?.status || '').toUpperCase();
      if (status === 'PARSED') return true;
      await new Promise(r => setTimeout(r, stepMs));
    }
    return false;
  };

  /** 업로드→상태→아이템→결과화면 이동 */
  const onCapture = async () => {
    try {
      const r = await api.post(`/api/quiz/sessions`, {});
      // success:false + error.session 스냅샷 대응
      if (r.data?.success === false && r.data?.error?.code === "SESSION_ALREADY_ACTIVE") {
        const snapshot = r.data?.error?.session;
        const sid = snapshot?.id ?? snapshot?.sessionId ?? snapshot?.session_id;
        if (sid) {
          const ok = await fetchById(Number(sid));
          if (ok) return true;
        }
        setErrorText("이미 진행 중인 세션이 있어요. 이어받기를 시도해주세요.");
        return false;
      }

      const picture = await cameraRef.current?.takePictureAsync({ quality: 0.9, skipProcessing: true });
      if (!picture?.uri) {
        Alert.alert('촬영 실패', '이미지를 가져오지 못했습니다.');
        return;

      }
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [fetchById, resumeFromActive, createSession, fetchAttemptsLeft, errorText]);

  useEffect(() => {
    boot();
  }, [boot]);

      // 1MB 이하로 축소
      const shrunk = await shrinkToUnder1MB(picture.uri);

      // 업로드 (FormData + Blob)
      const blob = await uriToBlob(shrunk.uri);
      const form = new FormData();
      form.append('file', blob as any, 'receipt.jpg');

      const up = await api.post('/api/receipts/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const receiptId: number = Number(up.data?.receipt_id);
      if (!receiptId) {
        Alert.alert('업로드 실패', '영수증 ID가 없습니다.');
        return;
      }

      // 상태 PARSED 대기
      const ok = await waitUntilParsed(receiptId, 30000, 1200);
      if (!ok) throw new Error('분석이 완료되지 않았습니다.');

      // 아이템 미리 받아서 결과화면에 즉시 표시
      const itemsRes = await api.get(`/api/receipts/${receiptId}/items`);
      const items = Array.isArray(itemsRes.data?.items) ? itemsRes.data.items : [];

      router.replace({
        pathname: '/scanResult',
        params: {
          receiptId: String(receiptId),
          data: JSON.stringify(items),
        },
      });
    } catch (e: any) {
      console.error('📸 업로드/분석 실패:', e?.response?.data || e?.message || e);
      Alert.alert('실패', e?.response?.data?.message || e?.message || '분석 중 오류가 발생했습니다.');

    } finally {
      setAnswering(false);
    }
  },
  [session, softExpired, answers, answering]
);

  const onFinish = useCallback(async () => {
    // 사용자가 버튼을 눌렀을 때만 종료 처리
    await clearActiveId();
    await fetchAttemptsLeft();
    setSession(null);
    setAnswers({});
    setShowCompletion(false);
    setFeedback({ show: false, correct: false });
    setErrorText("세 문제 모두 풀었어요! 오늘은 여기까지 🎉 내일 다시 도전하세요.");
  }, [fetchAttemptsLeft]);

  /** ===== 화면 ===== */
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

      {/* 오버레이: CameraView 위에 절대배치 (children 경고 회피) */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start' }]}>
        <View style={styles.guideBox} />
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>박스 안에 맞춰 영수증을 찍어주세요</Text>
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
        {/* 만료 배너 */}
        {softExpired && (
          <View style={styles.expiredBanner}>
            <Text style={styles.expiredText}>세션이 만료되었습니다</Text>
            <TouchableOpacity onPress={boot} style={styles.expiredButton}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>새로 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* 하단 컨트롤 */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={onCapture} style={styles.captureButton} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.captureText}>촬영</Text>}
        </TouchableOpacity>
      </View>

      {/* 완료 오버레이(사용자 버튼으로 종료) */}
      {showCompletion && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>오늘의 퀴즈 완료 🎉</Text>
            <Text style={styles.overlayBody}>
              정답 {correctSoFar}/{session.total} · 수고했어요!
            </Text>
            <Text style={[styles.overlayBody, { marginTop: 4, color: "#6b7280" }]}>오늘은 여기까지. 내일 다시 도전하세요!</Text>
            <TouchableOpacity onPress={onFinish} style={styles.overlayBtn}>
              <Text style={styles.overlayBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#000' },

  guideBox: {
    position: 'absolute',
    top: `${GUIDE.topPct * 100}%`,
    left: `${GUIDE.sidePct * 100}%`,
    right: `${GUIDE.sidePct * 100}%`,
    height: `${GUIDE.heightPct * 100}%`,
    borderColor: '#00FF00',
    borderWidth: 2,
    borderRadius: 8,

  },
  overlayCard: {
    width: "84%", backgroundColor: "#fff", borderRadius: 16, padding: 18,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb",
  },
  overlayTitle: { fontSize: 18, fontWeight: "800", color: "#111827", textAlign: "center" },
  overlayBody: { marginTop: 8, fontSize: 14, color: "#111827", textAlign: "center" },
  overlayBtn: {
    marginTop: 14, backgroundColor: "#111827", borderRadius: 12, paddingVertical: 12, alignItems: "center",
  },
  overlayBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
