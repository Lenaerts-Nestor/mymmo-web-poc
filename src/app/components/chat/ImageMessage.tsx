interface ImageMessageProps {
  attachments: Array<{
    source: string;
    thumbnail?: string;
    file_type?: string;
    type: string;
  }>;
}

export function ImageMessage({ attachments }: ImageMessageProps) {
  const imageAttachments = attachments.filter((att) => att.type === "image");

  if (imageAttachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {imageAttachments.map((attachment, index) => (
        <img
          key={index}
          src={attachment.source}
          alt="Shared image"
          className="max-w-xs max-h-64 rounded-lg shadow-sm cursor-pointer hover:opacity-90"
          onClick={() => window.open(attachment.source, "_blank")}
        />
      ))}
    </div>
  );
}
