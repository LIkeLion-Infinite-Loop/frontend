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
      (setHasPermission as React.Dispatch<React.SetStateAction<boolean | null>>)(status === 'granted');
    })();
  }, []);

  // 바코드 변수에 string 타입을 명시적으로 지정
  const handleBarCodeScanned = ({ data: barcode }: { data: string }) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    console.log(`스캔된 바코드: ${barcode}`);

    router.push({
      pathname: '/scan-result/[barcode]',
      params: { barcode: barcode },
    });

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
      />

      {/* 마스크 및 안내문구 */}
      <View style={styles.maskContainer}>
        {/* 오버레이 레이어 */}
        <View style={styles.overlayTop}>
          {/* 안내 문구: overlayTop 안에 배치하여 함께 움직이도록 함 */}
          <Text style={styles.scanInstructionText}>
            바코드나 QR 코드를 사각형 안에 비춰주세요
          </Text>
        </View>

        <View style={styles.middleRow}>
          <View style={styles.overlaySide} />
          <View style={styles.scanBox} />
          <View style={styles.overlaySide} />
        </View>

        <View style={styles.overlayBottom} />
      </View>
    </View>
  );

}
const SCAN_BOX_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center', // 텍스트를 중앙에 배치하기 위해 추가
    alignItems: 'center', // 텍스트를 중앙에 배치하기 위해 추가
  },
  text: { // 'text' 스타일 추가
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  maskContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanInstructionText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 20,
  },
  overlayTop: {
    flex: 2.5,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_BOX_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  overlayBottom: {
    flex: 0.1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
