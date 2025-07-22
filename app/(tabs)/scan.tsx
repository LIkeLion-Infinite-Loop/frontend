import { Button, Alert, Linking, View, Text, StyleSheet } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraView } from 'expo-camera';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isProcessing = useRef(false);
  const timerRef = useRef<number | null>(null);

  // 권한 요청 및 타이머 클린업을 위한 useEffect
  useEffect(() => {
    // 앱 시작 시 카메라 권한 요청
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // 컴포넌트가 화면에서 사라질 때 실행될 클린업 함수
    // 만약 설정된 타이머가 있다면, 이를 제거하여 메모리 누수를 방지
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []); // 이 useEffect는 처음 마운트될 때 한 번만 실행됩니다.

  // 바코드 스캔 처리 함수
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // 현재 다른 스캔을 처리 중인 경우, 새로운 스캔 이벤트를 무시하고 즉시 종료
    if (isProcessing.current) {
      return;
    }

    // 처리 시작을 알리는 플래그를 즉시 true로 설정
    isProcessing.current = true;

    Alert.alert(
      '스캔 완료',
      `데이터: ${data}`,
      [
        { text: '확인' },
        { text: '웹 검색', onPress: () => Linking.openURL(`https://www.google.com/search?q=${data}`) }
      ],
      { cancelable: false }
    );

    console.log(`스캔된 데이터: ${data}`);

    // 3초 후에 다시 스캔이 가능하도록 플래그를 false로 변경
    timerRef.current = setTimeout(() => {
      isProcessing.current = false;
      console.log('3초 후 다시 스캔이 활성화됩니다.');
    }, 3000);
  };
  
  // 권한 상태에 따른 UI 렌더링
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

  // 권한이 있을 경우 스캐너 UI 렌더링
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