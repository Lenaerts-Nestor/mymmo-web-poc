import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { UI_MESSAGES } from "../../constants/app";
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setIsLoading(true);

        // If a specific person ID is required, validate access to that person
        if (requiredPersonId) {
          const hasAccess = await SessionService.validatePersonAccess(
            requiredPersonId
          );

          if (!hasAccess) {
            console.warn(
              `Unauthorized access attempt to person ${requiredPersonId}`
            );
            router.push(fallbackUrl);
            return;
          }
        } else {
          // Just check if there's a valid session
          const session = await SessionService.getSession();

          if (!session) {
            console.warn("No valid session found");
            router.push(fallbackUrl);
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Access validation failed:", error);
        router.push(fallbackUrl);
      } finally {
        setIsLoading(false);
      }
    };

    validateAccess();
  }, [requiredPersonId, router, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message={UI_MESSAGES.LOADING.SESSION} />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will be redirecting
  }

  return <>{children}</>;
}
