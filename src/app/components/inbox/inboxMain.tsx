// src/app/components/inbox/inboxMain.tsx - Enhanced Brand Styling

export function InboxMain() {
  return (
    <div className="bg-white border border-[#CFC4C7] rounded-[20px] shadow-sm p-8 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#552E38] mb-2">Inbox</h1>
          <p className="text-[#A69298] text-base font-medium">
            Beheer je berichten en conversaties
          </p>
        </div>

        {/* Enhanced live status indicator */}
        <div className="flex items-center space-x-3 bg-[#ACED94] px-4 py-2 rounded-[15px] border border-[#CFC4C7]">
          <div className="w-3 h-3 bg-[#552E38] rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-[#552E38]">
            Live updates
          </span>
        </div>
      </div>
    </div>
  );
}
