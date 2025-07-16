import { useState, useEffect } from "react";
import SessionService from "../services/sessionService";
import { SessionData } from "../types/ouath/session";

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sessionData = await SessionService.getSession();
        setSession(sessionData);
      } catch (err) {
        setError("Failed to fetch session");
        console.error("Session fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  const validatePersonAccess = async (personId: string): Promise<boolean> => {
    return await SessionService.validatePersonAccess(personId);
  };

  const clearSession = async (): Promise<void> => {
    setSession(null);
    await SessionService.clearSession();
  };

  return {
    session,
    isLoading,
    error,
    validatePersonAccess,
    clearSession,
    isAuthenticated: !!session,
  };
}
