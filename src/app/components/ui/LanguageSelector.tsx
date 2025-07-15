import { LanguageSelectorProps } from "@/app/types/ui/LanguageSelector";
import React from "react";

export default function LanguageSelector({
  label,
  languages,
  value,
  onChange,
  className = "",
}: LanguageSelectorProps) {
  return (
    <div className={className}>
      <label className="block mb-1 font-medium">{label}</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
