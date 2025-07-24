// Simple image service matching backend format

export function createImageAttachments(files: File[]) {
  return files.map(file => ({
    source: URL.createObjectURL(file),
    file_type: file.type,
    type: "image"
  }));
}
