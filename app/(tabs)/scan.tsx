// app/(tabs)/receiptScan.tsx

import { useIsFocused } from '@react-navigation/native';
import { Camera, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReceiptScanScreen() {
  const cameraRef = useRef<Camera | null>(null);
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        console.log('📸 촬영 성공:', photo.uri);
        Alert.alert('촬영 완료', photo.uri);
        router.push('/receiptResult'); // 👉 결과 화면 이동
      } catch (error) {
        console.error('📸 촬영 실패:', error);
        Alert.alert('촬영 오류', '문제가 발생했습니다.');
      }
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          type={CameraType.back}
          ratio="16:9"
        >
          <View style={styles.guideBox} />
          <Text style={styles.guideText}>박스 안에 맞춰 영수증을 찍어주세요</Text>
        </Camera>
      )}

      <View style={styles.controls}>
        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
          <Text style={styles.captureText}>촬영</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: '#000' },
  guideBox: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    height: '60%',
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 8,
  },
  guideText: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#06D16E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
  },
  captureText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#06D16E',
    padding: 12,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});