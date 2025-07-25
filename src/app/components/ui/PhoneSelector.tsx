import React from "react";

interface PhoneOption {
  label: string;
  value: string;
}

interface PhoneSelectorProps {
  label: string;
  phones: PhoneOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PhoneSelector({
  label,
  phones,
  value,
  onChange,
  placeholder = "-- Kies telefoonnummer --",
  className = "",
}: PhoneSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[#552e38] mb-2">
        {label}
      </label>
      <select
        className="w-full px-4 py-3 border border-[rgba(207,196,199,0.5)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facf59] focus:border-[#facf59] text-[#552e38] bg-white placeholder-[#a69298] transition-all duration-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {phones.map((phone) => (
          <option key={phone.value} value={phone.value}>
            {phone.label}
          </option>
        ))}
      </select>
    </div>
  );
}
