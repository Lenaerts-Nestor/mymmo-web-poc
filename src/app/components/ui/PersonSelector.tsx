// src/components/ui/PersonSelector.tsx
import { PersonSelectorProps } from "@/app/types/ui/LanguageSelector";
import React from "react";

export default function PersonSelector({
  label,
  persons,
  value,
  onChange,
  placeholder = "-- Selecteer persoon --",
  className = "",
}: PersonSelectorProps) {
  return (
    <div className={className}>
      <label className="block mb-1 font-medium">{label}</label>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {persons.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name}
          </option>
        ))}
      </select>
    </div>
  );
}
