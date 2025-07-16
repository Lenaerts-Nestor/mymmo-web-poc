import { Inbox } from "lucide-react";

export function InboxHeader() {
  return (
    <div className="w-full flex justify-between ">
      <h1 className="text-4xl font-bold text-stone-800 text-center">Inbox</h1>

      <div className="flex items-center space-x-10">
        <span className="text-gray-500 flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
          <Inbox size={20} />
          inbox
        </span>
        <p>X unread messages</p>
      </div>
    </div>
  );
}
