"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useUnifiedApp } from "../../contexts/UnifiedAppContext";
import SessionService from "../../services/sessionService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPersonId?: string;
  fallbackUrl?: string;
}

export function ProtectedRoute({
  children,
  requiredPersonId,
  fallbackUrl = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isUserLoading } = useUnifiedApp();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setIsValidating(true);

        if (isUserLoading) {
          return;
        }

        if (!user) {
          console.warn("No user session found");
          router.push(fallbackUrl);
          return;
        }

        if (requiredPersonId) {
          if (user.personId !== requiredPersonId) {
            console.warn(
              `User ${user.personId} attempted to access person ${requiredPersonId} data`
            );
            router.push(fallbackUrl);
            return;
          }

          const hasAccess = await SessionService.validatePersonAccess(
            requiredPersonId
          );

          if (!hasAccess) {
            console.warn(
              `Session validation failed for person ${requiredPersonId}`
            );
            router.push(fallbackUrl);
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Access validation failed:", error);
        router.push(fallbackUrl);
      } finally {
        setIsValidating(false);
      }
    };

    validateAccess();
  }, [requiredPersonId, router, fallbackUrl, user, isUserLoading]);

  if (isUserLoading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
