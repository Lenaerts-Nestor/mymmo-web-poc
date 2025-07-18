// src/app/components/chat/ChatInput.tsx

import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  isTyping: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  isSending,
  error,
  inputRef,
  isTyping,
}: ChatInputProps) {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Typ je bericht... (Enter om te verzenden, Shift+Enter voor nieuwe regel)"
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
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
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="text-xs text-gray-500 mt-2">Aan het typen...</div>
        )}
      </div>
    </div>
  );
}
