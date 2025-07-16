interface InboxCardProps {
  department: string;
  subtitle: string;
  senderInitials: string;
  senderName: string;
  messagePreview: string;
  messageCount: number;
  date: string;
}

export function InboxCard({
  department = "Support Team",
  subtitle = "General support inquiries",
  senderInitials = "AS",
  senderName = "Alice Smith",
  messagePreview = "Hi, I have a question about my order.",
  messageCount = 2,
  date = "15 jul",
}: InboxCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {department}
          </h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full mb-1">
            {messageCount}
          </div>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
          {senderInitials}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">{senderName}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{messagePreview}</p>
        </div>
      </div>
    </div>
  );
}
