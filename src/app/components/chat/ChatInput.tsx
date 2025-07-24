// src/app/components/chat/ChatInput.tsx - CLEANED

import { Send, Image, X } from "lucide-react";
import { useRef, useState } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onImageUpload?: (files: File[]) => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  isSending,
  error,
  inputRef,
  onImageUpload,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...imageFiles]);
      
      // Generate previews
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews(prev => [...prev, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendWithImages = () => {
    if (selectedImages.length > 0 && onImageUpload) {
      onImageUpload(selectedImages);
    }
    if (value.trim()) {
      onSend();
    }
    // Clear images after sending
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const canSend = value.trim() || selectedImages.length > 0;
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 px-4 py-4">
      <div className="max-w-full">
        {error && (
          <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-300 rounded-xl shadow-sm">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  disabled={isSending}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="p-3.5 text-gray-600 bg-white border-2 border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-lg"
            title="Afbeelding toevoegen"
          >
            <Image className="w-5 h-5" />
          </button>

          <button
            onClick={handleSendWithImages}
            disabled={!canSend || isSending}
            className="p-3.5 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            style={{
              backgroundColor:
                !canSend || isSending ? "#d1d5db" : "var(--primary-cream)",
              color: "var(--text-medium-brown)",
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
