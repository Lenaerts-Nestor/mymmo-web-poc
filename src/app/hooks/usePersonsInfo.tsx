import { useQuery } from "@tanstack/react-query";
import { PersonEndpoint } from "@/app/types/person";
import MyMMOApiZone from "../services/mymmo-service/apiZones";

export function usePersonInfo(personId: string, translationLang: string) {
  return useQuery({
    queryKey: ["person", personId],
    queryFn: async (): Promise<PersonEndpoint> => {
      const personIdNum = parseInt(personId);
      const response = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      if (!response.data.person?.[0]) {
        throw new Error("Person not found");
      }

      return response.data.person[0];
    },
    //! todo change this to a constant
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!personId,
    select: (data) => data,
  });
}
