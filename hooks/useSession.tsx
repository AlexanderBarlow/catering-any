import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearSession,
  getToken,
  getUser,
  saveSession,
  Session,
  SessionUser,
} from "../src/auth/session";

// IMPORTANT: these keys must match session.ts
const TOKEN_KEY = "analytics_token";
const USER_KEY = "analytics_user";

type State = {
  loading: boolean;
  token: string | null;
  user: SessionUser | null;
};

type SessionCtx = State & {
  refresh: () => Promise<void>;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: SessionUser) => Promise<void>; // ✅ NEW
  isAuthed: boolean;
  isAdmin: boolean;
};

const SessionContext = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    loading: true,
    token: null,
    user: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const [t, u] = await Promise.all([getToken(), getUser()]);
    setState({ loading: false, token: t, user: u });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (session: Session) => {
    await saveSession(session);
    setState({ loading: false, token: session.token, user: session.user });
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setState({ loading: false, token: null, user: null });
  }, []);

  // ✅ NEW: update user in storage + state
  const setUser = useCallback(
    async (user: SessionUser) => {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      setState((s) => ({ ...s, user }));
    },
    [setState]
  );

  const value = useMemo<SessionCtx>(() => {
    const isAuthed = !!state.token && !!state.user;
    const isAdmin =
      String(state.user?.role || "").toUpperCase() === "ADMIN" ||
      String(state.user?.role || "").toUpperCase() === "MANAGER" ||
      String(state.user?.role || "").toUpperCase() === "STAFF";

    return {
      ...state,
      refresh,
      signIn,
      signOut,
      setUser,
      isAuthed,
      isAdmin,
    };
  }, [state, refresh, signIn, signOut, setUser]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx)
    throw new Error("useSession must be used inside <SessionProvider />");
  return ctx;
}
