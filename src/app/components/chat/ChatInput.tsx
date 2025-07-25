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
            //TODO: Uncomment when image previews are needed
            // setImagePreviews((prev) => [...prev, e.target.result as string]);
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
    // Send images with text if any are selected
    if (selectedImages.length > 0 && onImageUpload) {
      onImageUpload(selectedImages);
      // Clear images after sending
      setSelectedImages([]);
      setImagePreviews([]);
    } else if (value.trim()) {
      // Only send text message if no images are selected
      onSend();
    }
  };

  const canSend = value.trim() || selectedImages.length > 0;

  return (
    <div className="bg-gradient-to-r from-[var(--pure-white)] to-[var(--primary-offwhite)] border-t-2 border-[var(--gravel-100)] px-6 py-4 shadow-lg">
      {" "}
      {/* pure-white to primary-offwhite, gravel-100 */}
      <div className="max-w-full">
        {error && (
          <div className="mb-4 p-4 bg-gradient-to-r from-[var(--secondary-melon)]/20 to-[var(--secondary-melon)]/10 border-2 border-[var(--error)] rounded-xl shadow-sm">
            <p className="text-sm text-[var(--error)] font-medium flex items-center gap-2">
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
                  className="w-20 h-20 object-cover rounded-xl border-2 border-[var(--gravel-100)] shadow-md"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--error)] text-[var(--pure-white)] rounded-full flex items-center justify-center hover:bg-[var(--error)]/80 transition-colors shadow-md"
                  disabled={isSending}
                >
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
              className="w-full px-5 py-4 border-2 border-[var(--gravel-100)] rounded-2xl resize-none focus:ring-2 focus:ring-[var(--secondary-lightblue)] focus:border-[var(--secondary-lightblue)] transition-all duration-200 text-[var(--primary-wine)] placeholder-[var(--gravel-300)] shadow-sm hover:border-[var(--gravel-300)] bg-[var(--pure-white)] font-medium"
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
            className="p-4 text-[var(--primary-wine)] bg-[var(--pure-white)] border-2 border-[var(--gravel-100)] rounded-2xl hover:border-[var(--primary-sunglow)] hover:bg-[var(--primary-sunglow)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
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
                ? "bg-[var(--secondary-lightblue)] text-[var(--primary-wine)] hover:bg-[var(--secondary-lightblue)]/80 border-2 border-[var(--secondary-lightblue)]"
                : "bg-[var(--gravel-100)] text-[var(--gravel-300)] border-2 border-[var(--gravel-100)]"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicators */}
        {selectedImages.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Badge className="bg-[var(--primary-sunglow)]/20 text-[var(--primary-wine)] px-3 py-1 rounded-full font-medium">
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
