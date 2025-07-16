// src/app/components/LoginForm.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "./ui/LanguageSelector";
import PersonSelector from "./ui/PersonSelector";
import { appLanguages, deepLLanguages } from "../constants/languages";
import SessionService from "../services/sessionService";
import { useUser } from "../contexts/UserContext";

//tijdelijk hier , //! verwijderen dit later
const mockPersons = [
  { id: "925", name: "Persoon 925" },
  { id: "778", name: "Persoon 778" },
];

export default function LoginForm() {
  const [selectedPerson, setSelectedPerson] = useState("");
  const [appLanguage, setAppLanguage] = useState("nl");
  const [translationLanguage, setTranslationLanguage] = useState("nl");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useUser();

  const handlePersonLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPerson) {
      alert("Selecteer een persoon om door te gaan.");
      return;
    }

    setIsLoading(true);
    console.log(
      "LoginForm: Starting login process for person:",
      selectedPerson
    );

    try {
      await SessionService.clearSession();

      const sessionData = await SessionService.createSession(
        selectedPerson,
        appLanguage,
        translationLanguage
      );

      await refreshUser();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const targetUrl = `/zones/${selectedPerson}`;
      const params = new URLSearchParams({
        appLang: sessionData.appLang,
        translationLang: sessionData.translationLang,
      });

      const fullUrl = `${targetUrl}?${params.toString()}`;
      router.refresh();
      router.push(fullUrl);
    } catch (error) {
      alert("Inloggen mislukt. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
      <div className="bg-blue-600 rounded-full w-14 h-14 flex items-center justify-center mb-4">
        <span role="img" aria-label="user" className="text-white text-2xl">
          😂
        </span>
      </div>

      <h2 className="text-2xl font-bold mb-2">Aanmelden</h2>
      <p className="text-gray-500 mb-6 text-center text-sm">
        Kies een bestaande persoon om aan te melden
      </p>

      <form className="w-full" onSubmit={handlePersonLogin}>
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
          className={`w-full font-semibold py-2 rounded transition-colors ${
            isLoading
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Inloggen..." : "Inloggen als geselecteerde persoon"}
        </button>
      </form>
    </div>
  );
}
