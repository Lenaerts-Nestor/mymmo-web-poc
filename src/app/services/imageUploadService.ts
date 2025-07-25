// Image service with proper file upload handling

export async function uploadImageFile(file: File): Promise<any> {
  // For now, skip the upload attempt and go directly to base64
  // since we don't have a working upload endpoint

  return new Promise<any>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        source: reader.result as string,
        fileType: file.type, // Backend expects 'fileType', not 'file_type'
        type: "image",
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  });
}

export async function processImageAttachments(files: File[]) {
  const attachmentPromises = files.map(uploadImageFile);
  return Promise.all(attachmentPromises);
}
