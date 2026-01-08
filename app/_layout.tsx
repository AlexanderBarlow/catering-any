import React, { useEffect, useMemo } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SessionProvider, useSession } from "../hooks/useSession";

function RootGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { loading, isAuthed } = useSession();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";

    if (!isAuthed && !inAuth) router.replace("/(auth)/login");
    if (isAuthed && inAuth) router.replace("/(tabs)");
  }, [loading, isAuthed, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RootGuard />
      </SessionProvider>
    </QueryClientProvider>
  );
}
