// app/receiptScan.tsx (예시 경로)
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../lib/api"; // 너의 axios 인스턴스

const GUIDE = { topPct: 0.2, sidePct: 0.1, heightPct: 0.6 };

export default function ReceiptScanScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);

  // 권한 객체가 아직 로딩 전
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>권한 상태 확인 중…</Text>
      </View>
    );
  }

  // 권한 미허용
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
      if (busy) return;
      setBusy(true);

      // 1) 촬영
      const photo = await cameraRef.current?.takePictureAsync({ base64: false });
      if (!photo?.uri) throw new Error("사진 촬영 실패");

      // 2) 리사이즈/압축 (서버 1MB 제한 대비)
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 3) 업로드
      const formData = new FormData();
      formData.append("file", {
        uri: manipulated.uri,
        type: "image/jpeg",
        name: `receipt_${Date.now()}.jpg`,
      } as any);

      const res = await api.post("/api/receipts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📤 업로드 성공:", res.data);

      const receiptId = res.data?.receipt_id;
      if (!receiptId) throw new Error("receipt_id 없음");

      // 4) 결과 화면 이동
      router.push({
        pathname: "/scanResult",
        params: { receiptId: String(receiptId) },
      });
    } catch (e: any) {
      console.error("📸 업로드/분석 실패:", e);
      Alert.alert("실패", e?.message || "Network request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1) CameraView: 자식 없이 단독 */}
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          autofocus="on"
        />
      )}

      {/* 2) 오버레이: 카메라 '바깥'에 형제 View로 절대배치 */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View style={styles.guideBox} />
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>박스 안에 맞춰 영수증을 찍어주세요</Text>
        </View>
      </View>

      {/* 3) 하단 컨트롤 */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={onCapture} style={styles.captureButton} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.captureText}>촬영</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, position: "relative", backgroundColor: "#000" },

  guideBox: {
    position: "absolute",
    top: `${GUIDE.topPct * 100}%`,
    left: `${GUIDE.sidePct * 100}%`,
    right: `${GUIDE.sidePct * 100}%`,
    height: `${GUIDE.heightPct * 100}%`,
    borderColor: "#00FF00",
    borderWidth: 2,
    borderRadius: 8,
  },
  captionWrap: {
    position: "absolute",
    bottom: "16%",
    width: "100%",
    alignItems: "center",
  },
  caption: { color: "#fff", fontSize: 14, fontWeight: "500", opacity: 0.9 },

  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "#06D16E",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    minWidth: 120,
    alignItems: "center",
  },
  captureText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  permissionText: { fontSize: 16, marginBottom: 16 },
  permissionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#06D16E",
    borderRadius: 20,
  },
  permissionButtonText: { color: "#fff", fontWeight: "bold" },
});