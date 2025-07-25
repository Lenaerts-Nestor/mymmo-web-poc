import React from "react";
import PersonSelector from "./ui/PersonSelector";
import LanguageSelector from "./ui/LanguageSelector";
import { appLanguages, deepLLanguages } from "../constants/languages";

interface LoginFormPersonProps {
  mockPersons: { id: string; name: string }[];
  selectedPerson: string;
  setSelectedPerson: (id: string) => void;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  translationLanguage: string;
  setTranslationLanguage: (lang: string) => void;
  isLoading: boolean;
  handlePersonLogin: (e: React.FormEvent) => void;
}

export default function LoginFormPerson({
  mockPersons,
  selectedPerson,
  setSelectedPerson,
  appLanguage,
  setAppLanguage,
  translationLanguage,
  setTranslationLanguage,
  isLoading,
  handlePersonLogin,
}: LoginFormPersonProps) {
  return (
    <form className="w-full space-y-5" onSubmit={handlePersonLogin}>
      <PersonSelector
        label="Bestaande persoon"
        persons={mockPersons}
        value={selectedPerson}
        onChange={setSelectedPerson}
      />
      <LanguageSelector
        label="Taal"
        languages={appLanguages}
        value={appLanguage}
        onChange={setAppLanguage}
      />
      <LanguageSelector
        label="Vertalingstaal"
        languages={deepLLanguages}
        value={translationLanguage}
        onChange={setTranslationLanguage}
      />
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full font-medium py-3 rounded-lg transition-all duration-200 ${
          isLoading
            ? "bg-[#cfc4c7] text-[#a69298] cursor-not-allowed"
            : "bg-[#552e38] text-white hover:bg-[#765860] active:bg-[#552e38]"
        }`}
      >
        {isLoading ? "Inloggen..." : "Inloggen als geselecteerde persoon"}
      </button>
    </form>
  );
}
