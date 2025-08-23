// app/lib/api.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** ==== 환경 ==== */
const API_BASE = "http://40.233.103.122:8080";

/** ==== 토큰 스토리지 ==== */
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

/** ==== Axios 인스턴스 ==== */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

/** ==== 동시 새로고침 제어 ==== */
let isRefreshing = false;
let waiters: Array<() => void> = [];

/** 개발 로그 헬퍼 */
const devLog = (...args: any[]) => {
  if (typeof __DEV__ !== "undefined" ? __DEV__ : true) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

/** 요청 인터셉터: Authorization 강제 주입 + Content-Type 보정 + 로그 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // refresh 엔드포인트는 인증 제외
    const isRefreshCall =
      (config.baseURL || "") + (config.url || "") ===
      `${API_BASE}/api/users/refresh`;

    let headers = config.headers ?? new AxiosHeaders();
    if (!(headers instanceof AxiosHeaders)) {
      headers = AxiosHeaders.from(headers);
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (!isRefreshCall) {
      const token = await getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    config.headers = headers;

    devLog(
      "[REQ]",
      config.method?.toUpperCase(),
      (config.baseURL || "") + (config.url || ""),
      {
        Authorization: (config.headers as any)?.Authorization ?? "(none)",
        "Content-Type": (config.headers as any)?.["Content-Type"],
      }
    );
    return config;
  },
  (error) => Promise.reject(error)
);

/** 응답 인터셉터: 401 단발 리프레시 + 재시도 시 새 토큰 보장 */
api.interceptors.response.use(
  (res) => {
    devLog("[RES]", res.status, res.config.url);
    return res;
  },
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    devLog("[ERR]", status, original?.url, error.response?.data || error.message);

    // refresh 자체 실패 → 즉시 로그아웃 처리
    const isRefreshFail =
      ((original?.baseURL || "") + (original?.url || "")) ===
      `${API_BASE}/api/users/refresh`;
    if (isRefreshFail) {
      await clearAuth();
      return Promise.reject(error);
    }

    // 401 처리: 한 번만 새로고침 시도
    if (status === 401 && !original?._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => waiters.push(resolve));
        // 재시도 전에 최신 토큰을 다시 주입
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

        // refresh는 별도 axios로
        const refreshRes = await axios.post(`${API_BASE}/api/users/refresh`, {
          refresh_token: rt,
        });

        const newAccess =
          refreshRes.data?.access_token || refreshRes.data?.accessToken;
        if (!newAccess) throw new Error("no access token in refresh response");

        await setAccessToken(newAccess);

        // 대기중 요청 깨우기
        waiters.forEach((fn) => fn());
        waiters = [];

        // 재시도 전에 새 토큰을 명시 주입
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
