import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE;

if (!API_BASE) {
  console.warn(
    "Missing EXPO_PUBLIC_API_BASE. Set it in .env or app config extra."
  );
}

// Use the SAME key as session.ts so everything stays consistent
const TOKEN_KEY = "analytics_token";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

type RequestOpts = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  tokenOverride?: string | null;
};

async function request(path: string, opts: RequestOpts = {}) {
  const { method = "GET", body, headers, tokenOverride } = opts;

  const storedToken = await getToken();
  const token = tokenOverride ?? storedToken;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data: any;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const http = {
  get: (path: string, opts?: Omit<RequestOpts, "method" | "body">) =>
    request(path, { ...opts, method: "GET" }),

  post: (
    path: string,
    body?: any,
    opts?: Omit<RequestOpts, "method" | "body">
  ) => request(path, { ...opts, method: "POST", body }),

  put: (
    path: string,
    body?: any,
    opts?: Omit<RequestOpts, "method" | "body">
  ) => request(path, { ...opts, method: "PUT", body }),

  del: (path: string, opts?: Omit<RequestOpts, "method" | "body">) =>
    request(path, { ...opts, method: "DELETE" }),
};
