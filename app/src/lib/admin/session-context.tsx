"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getImpersonation, watchSession, type Impersonation, type Session,
} from "./auth";

/**
 * Session context.
 *
 * Firebase resolves the signed-in user asynchronously, so pages cannot read
 * identity synchronously as they did under the demo store. The shell resolves
 * it once and shares it here; `useSession()` returns the effective session,
 * which is the impersonated person when staff are viewing as someone else.
 */
type Ctx = {
  /** The person the UI should render for. */
  session: Session | null;
  /** The real signed-in account, unchanged by impersonation. */
  actor: Session | null;
  impersonation: Impersonation | null;
  loading: boolean;
  refresh: () => void;
};

const SessionContext = createContext<Ctx>({
  session: null,
  actor: null,
  impersonation: null,
  loading: true,
  refresh: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [actor, setActor] = useState<Session | null>(null);
  const [impersonation, setImpersonation] = useState<Impersonation | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = watchSession((s, isLoading) => {
      setActor(s);
      setLoading(isLoading);
      if (!s) router.replace("/admin/login");
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    setImpersonation(getImpersonation());
  }, [nonce, actor]);

  return (
    <SessionContext.Provider
      value={{
        session: impersonation?.target ?? actor,
        actor,
        impersonation,
        loading,
        refresh: () => setNonce((n) => n + 1),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
