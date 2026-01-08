import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "analytics_token";
const USER_KEY = "analytics_user";

export type Role = "ADMIN" | "MANAGER" | "STAFF";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Session = {
  token: string;
  user: SessionUser;
};

export async function saveSession(session: Session) {
  await AsyncStorage.setItem(TOKEN_KEY, session.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUser(): Promise<SessionUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}
