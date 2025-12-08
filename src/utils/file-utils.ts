/**
 * Processed file data ready for API submission
 */
export interface ProcessedFile {
  fileName: string;
  contentType: string;
  size: number;
  fileData: string; // base64 encoded
}

/**
 * Converts a File object to base64 encoded data
 * @param file - The File object to convert
 * @returns Promise resolving to processed file data
 */
export const fileToBase64 = (file: File): Promise<ProcessedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Failed to read file ${file.name}`));
        return;
      }
      // Get the base64 string by removing the data URL prefix
      const base64String = reader.result.split(',')[1];
      resolve({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        fileData: base64String
      });
    };

    reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
    reader.readAsDataURL(file);
  });
};

/**
 * Converts multiple files to base64 encoded data
 * @param files - Array of File objects to convert
 * @returns Promise resolving to array of processed file data
 */
export const filesToBase64 = (files: File[]): Promise<ProcessedFile[]> => {
  return Promise.all(files.map(fileToBase64));
};

/**
 * Validates file size against a maximum
 * @param file - The File object to validate
 * @param maxMB - Maximum file size in megabytes (default: 10)
 * @returns true if file is within size limit
 */
export const validateFileSize = (file: File, maxMB: number = 10): boolean => {
  const maxBytes = maxMB * 1024 * 1024;
  return file.size <= maxBytes;
};

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Human-readable file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};
