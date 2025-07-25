import React from "react";

const phoneCodes = [
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+44", country: "UK" },
  // Add more as needed
];

interface PhoneCodeInputProps {
  code: string;
  number: string;
  onCodeChange: (code: string) => void;
  onNumberChange: (number: string) => void;
  className?: string;
}

export default function PhoneCodeInput({
  code,
  number,
  onCodeChange,
  onNumberChange,
  className = "",
}: PhoneCodeInputProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        className="px-3 py-3 border border-[rgba(207,196,199,0.5)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facf59] focus:border-[#facf59] text-[#552e38] bg-white min-w-[90px]"
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
      >
        {phoneCodes.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.code} ({opt.country})
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={number}
        onChange={(e) => onNumberChange(e.target.value)}
        placeholder="Telefoonnummer"
        className="flex-1 px-4 py-3 border border-[rgba(207,196,199,0.5)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facf59] focus:border-[#facf59] text-[#552e38] placeholder-[#a69298] transition-all duration-200"
        required
      />
    </div>
  );
}
