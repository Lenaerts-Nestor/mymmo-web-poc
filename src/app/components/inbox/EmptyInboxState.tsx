"use client";

import { CheckCircle } from "lucide-react";

export function EmptyInboxState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="bg-green-50 p-6 rounded-full mb-6">
        <CheckCircle size={48} className="text-green-500" />
      </div>
      
      <h2 className="text-2xl font-semibold text-[#552e38] mb-3">
        Inbox is leeg
      </h2>
      
      <p className="text-[#765860] text-center max-w-md mb-6">
        Alle berichten zijn gelezen! Je ontvangt hier nieuwe ongelezen berichten 
        van alle zones waar je lid van bent.
      </p>
      
      <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-[#765860]">
        💡 Tip: Nieuwe berichten verschijnen hier automatisch via live updates
      </div>
    </div>
  );
}