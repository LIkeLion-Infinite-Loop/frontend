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
      >
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanBox}>
            <Text style={styles.scanInstructionText}>바코드나 QR 코드를 사각형 안에 비춰주세요</Text>
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
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
  overlayBackground: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTop: {
    flex: 1,
    width: '100%',
    ...StyleSheet.absoluteFillObject,
    bottom: 'auto',
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    width: '100%',
    height: 250,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayBottom: {
    flex: 1,
    width: '100%',
    ...StyleSheet.absoluteFillObject,
    top: 'auto',
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanInstructionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    position: 'absolute',
    top: -40,
    width: '100%',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  }
});
