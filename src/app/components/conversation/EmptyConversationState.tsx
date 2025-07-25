import React from "react";
import { MessageCircle, Bell } from "lucide-react";

export function EmptyConversationState({
  showAllConversations,
}: {
  showAllConversations: boolean;
}) {
  return (
    <div className="text-center py-16 text-[#765860]">
      <div className="text-6xl mb-6">
        {showAllConversations ? (
          <MessageCircle className="w-16 h-16 mx-auto text-[#a69298]" />
        ) : (
          <Bell className="w-16 h-16 mx-auto text-[#a69298]" />
        )}
      </div>
      <h2 className="text-3xl font-bold mb-4 text-[#552e38]">
        {showAllConversations
          ? "Geen conversaties gevonden"
          : "Geen ongelezen conversaties"}
      </h2>
      <p className="text-lg text-[#765860] mb-4">
        {showAllConversations
          ? "Er zijn nog geen conversaties in deze zone."
          : "Alle conversaties zijn gelezen. Gebruik 'Alle conversaties' om alle threads te bekijken."}
      </p>
      <div className="inline-flex items-center gap-2 text-sm text-[#765860] bg-[#f5f2de] px-4 py-2 rounded-full">
        <div className="w-2 h-2 bg-[#aced94] rounded-full animate-pulse"></div>{" "}
        <span>Automatisch bijgewerkt</span>
      </div>
    </div>
  );
}
