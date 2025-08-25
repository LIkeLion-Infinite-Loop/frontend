import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE = "http://43.201.103.81:8080";

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
});

/** 유틸: FormData/Blob 여부 판단 (RN 호환) */
const isFormDataLike = (data: any) =>
  typeof FormData !== "undefined" && data instanceof FormData ||
  (data && typeof data.append === "function" && Array.isArray((data as any)?._parts));

const isBlobLike = (data: any) =>
  (typeof Blob !== "undefined" && data instanceof Blob) ||
  (data && typeof data.size === "number" && typeof data.type === "string" && typeof data.slice === "function");

let isRefreshing = false;
let waiters: Array<() => void> = [];

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isRefreshCall =
      ((config.baseURL || "") + (config.url || "")) ===
      `${API_BASE}/api/users/refresh`;

    // 헤더 객체 안전화
    let headers = config.headers ?? new AxiosHeaders();
    if (!(headers instanceof AxiosHeaders)) {
      headers = AxiosHeaders.from(headers);
    }

    // ✅ Content-Type 자동 설정 규칙
    // - 이미 호출부에서 명시했다면 건드리지 않음
    // - FormData인 경우: 절대 수동 설정 금지 (axios가 boundary 포함 자동 설정)
    // - Blob/바이너리: octet-stream
    // - 그 외: application/json
    if (!headers.has("Content-Type")) {
      const data = config.data;
      if (isFormDataLike(data)) {
        // do nothing
      } else if (isBlobLike(data)) {
        headers.set("Content-Type", "application/octet-stream");
      } else {
        headers.set("Content-Type", "application/json");
      }
    }

    // Authorization (refresh 호출은 제외)
    if (!isRefreshCall) {
      const token = await getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isRefreshFail =
      ((original?.baseURL || "") + (original?.url || "")) ===
      `${API_BASE}/api/users/refresh`;
    if (isRefreshFail) {
      await clearAuth();
      return Promise.reject(error);
    }

    if (status === 401 && !original?._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => waiters.push(resolve));
        const newToken = await getAccessToken();
        if (newToken) {
          let h = original.headers ?? new AxiosHeaders();
          if (!(h instanceof AxiosHeaders)) h = AxiosHeaders.from(h);
          h.set("Authorization", `Bearer ${newToken}`);
          original.headers = h;
        }
        return api(original);
      }

      try {
        isRefreshing = true;

        const rt = await getRefreshToken();
        if (!rt) throw new Error("no refresh token");

        // refresh는 JSON 바디 요청
        const refreshRes = await axios.post(`${API_BASE}/api/users/refresh`, {
          refresh_token: rt,
        });

        const newAccess =
          refreshRes.data?.access_token || refreshRes.data?.accessToken;
        if (!newAccess) throw new Error("no access token");

        await setAccessToken(newAccess);

        waiters.forEach((fn) => fn());
        waiters = [];

        const h0 = original.headers ?? new AxiosHeaders();
        const h =
          h0 instanceof AxiosHeaders ? h0 : AxiosHeaders.from(original.headers);
        h.set("Authorization", `Bearer ${newAccess}`);
        original.headers = h;

        return api(original);
      } catch (e) {
        await clearAuth();
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