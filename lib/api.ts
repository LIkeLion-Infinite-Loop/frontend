// api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { Alert } from "react-native";

const API_BASE = "http://43.201.103.81:8080";
const REFRESH_PATH = "/api/users/refresh";

export async function getAccessToken() {
  return AsyncStorage.getItem("userToken");
}
async function getRefreshToken() {
  return AsyncStorage.getItem("refreshToken");
}
async function setAccessToken(token: string) {
  await AsyncStorage.setItem("userToken", token);
}
async function clearAuth() {
  await AsyncStorage.multiRemove(["userToken", "refreshToken", "userInfo"]);
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  // withCredentials: false, // 쿠키 사용 안하면 주석 유지
});

/** ===== 바디 타입 유틸(RN 호환) ===== */
const isFormDataLike = (data: any) =>
  (typeof FormData !== "undefined" && data instanceof FormData) ||
  (data && typeof data.append === "function" && Array.isArray((data as any)?._parts));

const isBlobLike = (data: any) =>
  (typeof Blob !== "undefined" && data instanceof Blob) ||
  (data && typeof data.size === "number" && typeof data.type === "string" && typeof data.slice === "function");

/** ===== 토큰 갱신 동시성 제어 ===== */
let isRefreshing = false;
let waiters: Array<() => void> = [];

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const urlFull = `${config.baseURL || ""}${config.url || ""}`;
    const isRefreshCall = urlFull.endsWith(REFRESH_PATH);

    // 헤더 안전화
    let headers = config.headers ?? new AxiosHeaders();
    if (!(headers instanceof AxiosHeaders)) {
      headers = AxiosHeaders.from(headers);
    }

    // Content-Type 자동 설정
    // - GET/HEAD는 불필요(프리플라이트 줄이기)
    // - FormData는 axios가 boundary 자동 지정 → 건드리지 않음
    // - Blob은 octet-stream
    // - 그 외 JSON
    const method = (config.method || "get").toLowerCase();
    if (!headers.has("Content-Type") && method !== "get" && method !== "head") {
      const data = config.data;
      if (isFormDataLike(data)) {
        // leave it to axios
      } else if (isBlobLike(data)) {
        headers.set("Content-Type", "application/octet-stream");
      } else {
        headers.set("Content-Type", "application/json");
      }
    }

    // 🔑 토큰 헤더 (refresh 호출 제외)
    if (!isRefreshCall) {
      const token = await getAccessToken();
      if (token) {
        // 서버 스펙: accessToken 헤더 요구 → 반드시 추가
        headers.set("accessToken", token);
        // Authorization도 함께 넣어 호환성 확보
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // 디버그 찍고 싶을 때
    // if (__DEV__) console.log("[REQ]", config.method, config.url, { headers: headers.toJSON() });

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // 원래 요청 정보 없으면 그대로 반환
    if (!original) return Promise.reject(error);

    const urlFull = `${original.baseURL || ""}${original.url || ""}`;
    const isRefreshCall = urlFull.endsWith(REFRESH_PATH);

    // 리프레시 자체가 실패 → 인증 초기화
    if (isRefreshCall) {
      await clearAuth();
      Alert.alert("로그인 만료", "다시 로그인 해주세요.");
      // TODO: navigation.navigate("Login") 필요시 추가
      return Promise.reject(error);
    }

    // 401/403 → 토큰 만료/권한 문제로 보고 1회 리프레시 후 재시도
    if ((status === 401 || status === 403) && !original._retry) {
      original._retry = true;

      // 이미 갱신 중이면 대기 후 토큰 붙여 재시도
      if (isRefreshing) {
        await new Promise<void>((resolve) => waiters.push(resolve));
        const newToken = await getAccessToken();
        if (newToken) {
          let h = original.headers ?? new AxiosHeaders();
          if (!(h instanceof AxiosHeaders)) h = AxiosHeaders.from(h);
          h.set("accessToken", newToken);
          h.set("Authorization", `Bearer ${newToken}`);
          original.headers = h;
        }
        return api(original);
      }

      try {
        isRefreshing = true;

        const rt = await getRefreshToken();
        if (!rt) throw new Error("no refresh token");

        // refresh는 JSON 바디
        const refreshRes = await axios.post(`${API_BASE}${REFRESH_PATH}`, {
          refresh_token: rt,
        });

        const newAccess =
          refreshRes.data?.access_token || refreshRes.data?.accessToken;
        const newRefresh =
          refreshRes.data?.refresh_token || refreshRes.data?.refreshToken;

        if (!newAccess) throw new Error("no access token");

        await setAccessToken(newAccess);
        if (newRefresh) {
          await AsyncStorage.setItem("refreshToken", newRefresh);
        }

        // 대기열 해제
        waiters.forEach((fn) => fn());
        waiters = [];

        // 재시도에 새 토큰 부착
        const h0 = original.headers ?? new AxiosHeaders();
        const h = h0 instanceof AxiosHeaders ? h0 : AxiosHeaders.from(h0);
        h.set("accessToken", newAccess);
        h.set("Authorization", `Bearer ${newAccess}`);
        original.headers = h;

        return api(original);
      } catch (e) {
        // 리프레시 실패 → 로그아웃 처리 및 안내
        await clearAuth();
        Alert.alert("로그인 만료", "다시 로그인 해주세요.");
        // TODO: navigation.navigate("Login") 필요시 추가
        waiters.forEach((fn) => fn());
        waiters = [];
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);