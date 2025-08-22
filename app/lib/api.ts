// app/lib/api.ts
import axios, { AxiosError, AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://40.233.103.122:8080";

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

async function getAccessToken() {
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

// 요청 인터셉터: 토큰/헤더 주입
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  let headers = config.headers ?? new AxiosHeaders();
  if (!(headers instanceof AxiosHeaders)) headers = AxiosHeaders.from(headers);

  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
});

// 응답 인터셉터: 401 한 번만 리프레시
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const original = error.config as any;

    if (status === 401 && !original?._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => pendingQueue.push(resolve));
        return api(original);
      }

      try {
        isRefreshing = true;

        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("no refresh token");

        const res = await axios.post(`${API_BASE}/api/users/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccess = res.data?.access_token;
        if (!newAccess) throw new Error("no access token in refresh response");

        await setAccessToken(newAccess);

        pendingQueue.forEach((fn) => fn());
        pendingQueue = [];
        return api(original);
      } catch (e) {
        await clearAuth();
        pendingQueue.forEach((fn) => fn());
        pendingQueue = [];
        throw error;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);
