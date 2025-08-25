import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image as RNImage,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { api } from '@/lib/api';

const GUIDE = { topPct: 0.2, sidePct: 0.1, heightPct: 0.6 };

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
      setBusy(true);

      const picture = await cameraRef.current?.takePictureAsync({ quality: 0.9, skipProcessing: true });
      if (!picture?.uri) {
        Alert.alert('촬영 실패', '이미지를 가져오지 못했습니다.');
        return;
      }

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

      {/* 오버레이: CameraView 위에 절대배치 (children 경고 회피) */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start' }]}>
        <View style={styles.guideBox} />
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>박스 안에 맞춰 영수증을 찍어주세요</Text>
        </View>
      </View>

      {/* 하단 컨트롤 */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={onCapture} style={styles.captureButton} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.captureText}>촬영</Text>}
        </TouchableOpacity>
      </View>
    </View>
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