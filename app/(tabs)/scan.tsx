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
} from 'react-native';

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

  const onCapture = async () => {
    try {
      setBusy(true);

      // 실제 촬영은 하되 결과는 사용하지 않음(디자인 데모용)
      await cameraRef.current?.takePictureAsync();

      // 데모용 인식 결과(예시 데이터)와 함께 결과 화면으로 이동
      const demoItems = [
        { name: '펩시 제로 콜라 355ml', quantity: 1, material: 'CAN' },
        { name: '제주 삼다수 500ml', quantity: 2, material: 'PLASTIC' },
        { name: '제주 삼다수 500ml', quantity: 2, material: 'PLASTIC' },
        { name: '제주 삼다수 500ml', quantity: 2, material: 'PLASTIC' },
      ];

      router.push({
        pathname: '/scanResult',
        params: { data: JSON.stringify(demoItems) },
      });
    } catch (e) {
      console.error('📸 촬영 실패:', e);
      Alert.alert('촬영 오류', '문제가 발생했습니다.');
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
        >
          <View style={styles.guideBox} />
          <View style={styles.captionWrap}>
            <Text style={styles.caption}>박스 안에 맞춰 영수증을 찍어주세요</Text>
          </View>
        </CameraView>
      )}

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
  container: { flex: 1, position: 'relative', backgroundColor: '#000' },

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