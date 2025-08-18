import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button, ActivityIndicator, Alert, Linking, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack } from 'expo-router';
import { BarcodeScanningResult } from 'expo-camera/build/Camera.types';
import OverlayWithHole from '../OverlayWithHole'; 

const { width, height } = Dimensions.get('window');

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission, requestPermission]);

const handleBarCodeScanned = (scanningResult: BarcodeScanningResult) => {
  if (!scanned) {
    setScanned(true);
    const { type, data } = scanningResult;

    if (data === '8801056241506') {
      router.push(`/scan-result/${data}`);
      return;
    }

    Alert.alert(
      '바코드 스캔 완료!',
      `바코드 타입: ${type}\n데이터: ${data}`,
      [
        {
          text: '확인',
          onPress: () => {
            router.push(`/scan-result/${encodeURIComponent(data)}`);
            setScanned(false);
          },
        },
      ]
    );
  }
};



  if (permission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D16E" />
        <Text style={styles.permissionText}>카메라 권한 요청 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>카메라 접근 권한이 거부되었습니다.</Text>
        <Button
          title="권한 설정으로 이동"
          onPress={() => {
            Alert.alert(
              "권한 필요",
              "카메라를 사용하려면 기기 설정에서 권한을 허용해주세요.",
              [{ text: "확인", onPress: () => Linking.openSettings() }]
            );
          }}
          color="#FF6347"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: '바코드 스캔' }} />
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "code128", "datamatrix"],
        }}
        onCameraReady={() => console.log('Camera is ready')}
      >
        <OverlayWithHole />
        <View style={styles.instructionContainer}>
          <Text style={styles.instruction}>바코드를 사각형 안에 비춰주세요</Text>
        </View>
      </CameraView>

      {scanned && (
        <View style={styles.rescanButton}>
          <Button
            title="다시 스캔"
            onPress={() => setScanned(false)}
            color="#00D16E"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    color: '#333',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 160,
    width: '100%',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    zIndex: 1,
  }
});
