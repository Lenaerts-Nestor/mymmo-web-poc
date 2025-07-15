// src/components/LoginForm.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "./ui/LanguageSelector";
import PersonSelector from "./ui/PersonSelector";
import { appLanguages, deepLLanguages } from "../constants/languages";

//tijdelijk hier , //! verwijderen dit later
const mockPersons = [
  { id: "925", name: "Persoon 925" },
  { id: "2", name: "Persoon 2" },
];

export default function LoginForm() {
  const [selectedPerson, setSelectedPerson] = useState("");
  const [appLanguage, setAppLanguage] = useState("nl");
  const [translationLanguage, setTranslationLanguage] = useState("nl");
  const router = useRouter();

  const handlePersonLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Check if person is selected
    if (!selectedPerson) {
      alert("Selecteer een persoon om door te gaan.");
      return;
    }

    // Navigate to zones page with person ID and language parameters
    const params = new URLSearchParams({
      appLang: appLanguage,
      translationLang: translationLanguage,
    });

    router.push(`/zones/${selectedPerson}?${params.toString()}`);
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
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Inloggen als geselecteerde persoon
        </button>
      </form>
    </div>
  );
}
