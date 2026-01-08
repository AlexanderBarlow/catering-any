import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearSession,
  getToken,
  getUser,
  saveSession,
  Session,
  SessionUser,
} from "../src/auth/session";

type State = {
  loading: boolean;
  token: string | null;
  user: SessionUser | null;
};

type SessionCtx = State & {
  refresh: () => Promise<void>;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
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

  const value = useMemo<SessionCtx>(() => {
    const isAuthed = !!state.token && !!state.user;
    const isAdmin = state.user?.role === "ADMIN";
    return {
      ...state,
      refresh,
      signIn,
      signOut,
      isAuthed,
      isAdmin,
    };
  }, [state, refresh, signIn, signOut]);

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
