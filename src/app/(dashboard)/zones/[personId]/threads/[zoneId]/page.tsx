"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function ThreadsRedirectPage() {
  const { personId, zoneId } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new conversations page
    if (personId && zoneId) {
      router.replace(`/conversations/${personId}/${zoneId}`);
    }
  }, [personId, zoneId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
