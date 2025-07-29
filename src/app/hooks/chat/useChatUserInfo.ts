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
  const { threads: threadsData } = useThreads(
    personId,
    zoneId,
    translationLang,
    false
  );

  const currentThread = threadsData.find((t) => t._id === threadId);

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

    //! dit is ingeval dat er problemen zijn met de firstname enzo, tenminste zou de user verder gaan en dan buur tonen en verdres spreken zonder probleem.
    //! tot de firstname automatisch terug is.
    return {
      firstName: follower.firstName || "Buur",
      lastName: follower.lastName || "",
      profilePic: follower.profilePic || null,
    };
  };

  return { getUserInfo };
}
