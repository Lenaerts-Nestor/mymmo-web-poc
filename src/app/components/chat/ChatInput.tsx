// src/app/components/chat/ChatInput.tsx - Clean & Minimalist Design

import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  isSending,
  error,
  inputRef,
}: ChatInputProps) {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 px-4 py-4">
      <div className="max-w-full">
        {error && (
          <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-300 rounded-xl shadow-sm">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Typ je bericht..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl resize-none focus:ring-2 focus:border-gray-400 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm hover:border-gray-400 bg-white"
              style={{
                minHeight: "48px",
                maxHeight: "120px",
              }}
              disabled={isSending}
            />
          </div>

          <button
            onClick={onSend}
            disabled={!value.trim() || isSending}
            className="p-3.5 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            style={{
              background:
                !value.trim() || isSending
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #e4dece 0%, #d4c4a8 100%)",
              color: "#6b4e3d",
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
