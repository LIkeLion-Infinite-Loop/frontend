import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 상대 경로로 고정 (경로 alias 문제 방지)
import { api } from '@/lib/api';

const MAX_BYTES = 1024 * 1024; // 1MB

export default function ReceiptScanScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>권한 상태 확인 중…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // RN에서 FormData.append 타입 오류 회피용(파일 객체)
  const appendFile = (fd: FormData, field: string, uri: string, name = 'receipt.jpg', type = 'image/jpeg') => {
    // iOS: uri가 file:// 로 시작, Android: content:// 혹은 file://
    fd.append(field, { uri, name, type } as any);
  };

  const shrinkIfNeeded = async (uri: string): Promise<string> => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists && !info.isDirectory && (info as any).size > MAX_BYTES) {
        // quality 0.5로 다시 촬영했는데도 큰 경우가 드물지만,
        // 여기서는 간단히 경고만 띄우고 그대로 진행 (서버가 1MB 넘으면 400 반환)
        Alert.alert(
          '용량 경고',
          '이미지 용량이 커서 서버에서 거부될 수 있어요.\n가능하면 영수증을 더 멀리서 찍어 주세요(용량↓).'
        );
      }
    } catch {}
    return uri;
  };

  const waitUntilParsed = async (receiptId: number) => {
    let tries = 0;
    const maxTries = 10; // 약 15초
    while (tries < maxTries) {
      try {
        const res = await api.get(`/api/receipts/${receiptId}/status`);
        console.log('📡 상태 조회:', res.data);
        if (res.data?.status === 'PARSED') return true;
      } catch (e) {
        console.log('❌ 상태 조회 실패:', e);
      }
      tries++;
      await new Promise((r) => setTimeout(r, 1500));
    }
    // ===== 완화 패치: 끝까지 PARSED 안 되면 강제 이동 =====
    console.warn('⚠️ 분석이 끝나지 않아도 결과 화면으로 이동합니다.');
    router.push({ pathname: '/scanResult', params: { receiptId: String(receiptId) } });
    return false;
  };

  const onCapture = async () => {
    try {
      setBusy(true);

      // 화질 낮춰 촬영 (용량↓)
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.5, // 0~1
        skipProcessing: true,
      });
      if (!photo?.uri) {
        Alert.alert('촬영 오류', '사진 촬영에 실패했어요.');
        return;
      }

      const shrunkUri = await shrinkIfNeeded(photo.uri);

      // 업로드
      const fd = new FormData();
      appendFile(fd, 'file', shrunkUri, 'receipt.jpg', 'image/jpeg');

      const uploadRes = await api.post('/api/receipts/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const receiptId: number = uploadRes.data?.receipt_id;
      if (!receiptId) {
        throw new Error('receipt_id 누락');
      }

      // 상태 폴링 → PARSED면 이동, 아니면 위 완화패치가 강제 이동시킴
      const parsed = await waitUntilParsed(receiptId);
      if (parsed) {
        router.push({ pathname: '/scanResult', params: { receiptId: String(receiptId) } });
      }
    } catch (e: any) {
      console.error('📸 업로드/분석 실패:', e);
      Alert.alert('처리 실패', e?.response?.data?.message || e.message || '알 수 없는 오류');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          autofocus="on"
        />
      )}

      {/* 오버레이는 Camera 밖에 절대배치로 올림 */}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.guideBox} />
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>박스 안에 맞춰 영수증을 찍어주세요</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={onCapture} style={styles.captureButton} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.captureText}>촬영</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GUIDE = { topPct: 0.2, sidePct: 0.1, heightPct: 0.6 };

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#000' },

  // 카메라 위 오버레이
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start' },
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
  captionWrap: { position: 'absolute', bottom: '16%', width: '100%', alignItems: 'center' },
  caption: { color: '#fff', fontSize: 14, fontWeight: '500', opacity: 0.9 },

  controls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  captureButton: {
    backgroundColor: '#06D16E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  captureText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  permissionText: { fontSize: 16, marginBottom: 16 },
  permissionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#06D16E',
    borderRadius: 20,
  },
  permissionButtonText: { color: '#fff', fontWeight: 'bold' },
});