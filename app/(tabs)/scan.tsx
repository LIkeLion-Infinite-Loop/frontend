import { Button, Alert, Linking, View, Text, StyleSheet } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { CameraView, Camera } from 'expo-camera';
import { router } from 'expo-router';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []); 


  const handleBarCodeScanned = ({ data: barcode }: { data: string }) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    console.log(`스캔된 바코드: ${barcode}`);

    // ✅ TypeScript 오류를 해결하기 위해 router.push에 객체를 전달합니다.
    router.push({
      pathname: '/scan-result/[barcode]', // 정적인 경로 패턴
      params: { barcode: barcode },      // 동적인 파라미터
    });

    // 3초 후에 다시 스캔이 가능하도록 설정
    setTimeout(() => {
      isProcessing.current = false;
    }, 3000);
  };
  
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한 요청 중...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.</Text>
        <Button title="권한 설정 열기" onPress={() => Linking.openSettings()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.overlay}>
          <Text style={styles.scanInstructionText}>바코드나 QR 코드를 사각형 안에 비춰주세요</Text>
          <View style={styles.scanBox} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanInstructionText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  }
});
