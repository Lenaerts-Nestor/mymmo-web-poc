import { useThreads } from "@/app/hooks/threads/useThreads";

interface UseChatUserInfoProps {
  personId: string;
  zoneId: string;
  threadId: string;
  translationLang: string;
}

export function useChatUserInfo({
  personId,
  zoneId,
  threadId,
  translationLang,
}: UseChatUserInfoProps) {
  // Get thread data for follower info
  const { threads: threadsData } = useThreads(
    personId,
    zoneId,
    translationLang,
    false // Not active chat page for this call
  );

  // Get current thread for follower info
  const currentThread = threadsData.find((t) => t._id === threadId);

  // User info lookup function
  const getUserInfo = (createdBy: number) => {
    if (!currentThread?.followers) {
      return {
        firstName: "Buur",
        lastName: "",
        profilePic: null,
      };
    }

    const follower = currentThread.followers.find(
      (f) => f.person_id === createdBy
    );
    if (!follower) {
      return {
        firstName: "Buur",
        lastName: "",
        profilePic: null,
      };
    }

    return {
      firstName: follower.firstName || "Buur",
      lastName: follower.lastName || "",
      profilePic: follower.profilePic || null,
    };
  };

  return { getUserInfo };
}