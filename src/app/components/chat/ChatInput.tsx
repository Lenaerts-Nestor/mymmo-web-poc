"use client";

import type React from "react";

import { Send, ImageIcon, X, Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

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
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...imageFiles]);

      // Generate previews
      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews((prev) => [...prev, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
    <div className="bg-gradient-to-r from-[#ffffff] to-[#f5f2de] border-t-2 border-[#cfc4c7] px-6 py-4 shadow-lg">
      {" "}
      {/* pure-white to primary-offwhite, gravel-100 */}
      <div className="max-w-full">
        {error && (
          <div className="mb-4 p-4 bg-gradient-to-r from-[#ffb5b5]/20 to-[#ffb5b5]/10 border-2 border-[#b00205] rounded-xl shadow-sm">
            {" "}
            {/* secondary-melon/20 to secondary-melon/10, error color */}
            <p className="text-sm text-[#b00205] font-medium flex items-center gap-2">
              {" "}
              {/* error color */}
              <X className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border-2 border-[#cfc4c7] shadow-md"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[#b00205] text-[#ffffff] rounded-full flex items-center justify-center hover:bg-[#b00205]/80 transition-colors shadow-md"
                  disabled={isSending}
                >
                  {" "}
                  {/* error color */}
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Typ je bericht..."
              className="w-full px-5 py-4 border-2 border-[#cfc4c7] rounded-2xl resize-none focus:ring-2 focus:ring-[#b0c2fc] focus:border-[#b0c2fc] transition-all duration-200 text-[#552e38] placeholder-[#a69298] shadow-sm hover:border-[#a69298] bg-[#ffffff] font-medium"
              style={{
                minHeight: "56px",
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
            className="p-4 text-[#552e38] bg-[#ffffff] border-2 border-[#cfc4c7] rounded-2xl hover:border-[#facf59] hover:bg-[#facf59]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
            title="Afbeelding toevoegen"
          >
            {" "}
            {/* primary-wine, pure-white, gravel-100, primary-sunglow */}
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleSendWithImages}
            disabled={!canSend || isSending}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed ${
              canSend && !isSending
                ? "bg-[#b0c2fc] text-[#552e38] hover:bg-[#b0c2fc]/80 border-2 border-[#b0c2fc]" // secondary-lightblue, primary-wine
                : "bg-[#cfc4c7] text-[#a69298] border-2 border-[#cfc4c7]" // gravel-100, gravel-300
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicators */}
        {selectedImages.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Badge className="bg-[#facf59]/20 text-[#552e38] px-3 py-1 rounded-full font-medium">
              {" "}
              {/* primary-sunglow/20, primary-wine */}
              <Paperclip className="w-3 h-3 mr-1" />
              {selectedImages.length} afbeelding
              {selectedImages.length !== 1 ? "en" : ""} geselecteerd
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
