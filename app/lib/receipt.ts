import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { api } from "../lib/api";

const ONE_MB = 1_048_576;

async function shrinkToUnder1MB(uri: string): Promise<{ uri: string; type: string; name: string }> {
  let current = uri;
  let quality = 0.8;
  let targetWidth = 2000; // 시작 리사이즈 기준

  for (let step = 0; step < 6; step++) {
    const info = await FileSystem.getInfoAsync(current, { size: true });
    if (info.exists && (info.size ?? 0) < ONE_MB) {
      return { uri: current, type: "image/jpeg", name: "receipt.jpg" };
    }

    // 가로 기준으로 줄이기
    const manipulated = await ImageManipulator.manipulateAsync(
      current,
      [{ resize: { width: targetWidth } }], // ✅ longestSide 대신 width 사용
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    current = manipulated.uri;
    targetWidth = Math.max(600, Math.round(targetWidth * 0.75)); // 줄여나감
    quality = Math.max(0.4, quality - 0.1);
  }

  return { uri: current, type: "image/jpeg", name: "receipt.jpg" };
}

export async function uploadReceipt(originalUri: string) {
  const fixedUri = originalUri.startsWith("file://") ? originalUri : `file://${originalUri}`;
  const file = await shrinkToUnder1MB(fixedUri);

  const fd = new FormData();
  // @ts-expect-error RN FormData
  fd.append("file", { uri: file.uri, type: file.type, name: file.name });

  const res = await api.post("/api/receipts", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}