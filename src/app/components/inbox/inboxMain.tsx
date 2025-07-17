// src/app/components/inbox/inboxMain.tsx - Improved Design

export function InboxMain() {
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-stone-800">Inbox</h1>

        {/* Live status indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live updates</span>
        </div>
      </div>
    </div>
  );
}
