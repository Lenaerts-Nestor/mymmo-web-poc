// src/app/components/auth/ProtectedRoute.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { UI_MESSAGES } from "../../constants/app";
import { useUser } from "../../contexts/UserContext";
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
  const { user, isLoading: userLoading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setIsValidating(true);

        // Wait for user context to load
        if (userLoading) {
          return;
        }

        // No user session - redirect to login
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

          // Double-check with session service for security
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
  }, [requiredPersonId, router, fallbackUrl, user, userLoading]);

  // Show minimal loading for fast validation
  if (userLoading || isValidating) {
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
