// Shared limits for image uploads across the admin app.

export const MAX_IMAGE_SIZE_KB = 150;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_KB * 1024;

export const isImageSizeValid = (file: File): boolean =>
  file.size <= MAX_IMAGE_SIZE_BYTES;

export const imageSizeErrorMessage = (file: File): string =>
  `"${file.name}" is ${(file.size / 1024).toFixed(0)} KB, which exceeds the ${MAX_IMAGE_SIZE_KB} KB limit`;

// Shared limits for the proposal PDF upload.

export const MAX_PDF_SIZE_MB = 5;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

export const isPdfFile = (file: File): boolean =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const isPdfSizeValid = (file: File): boolean =>
  file.size <= MAX_PDF_SIZE_BYTES;

export const pdfValidationError = (file: File): string | null => {
  if (!isPdfFile(file)) return `"${file.name}" is not a PDF file`;
  if (!isPdfSizeValid(file)) {
    return `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB, which exceeds the ${MAX_PDF_SIZE_MB} MB limit`;
  }
  return null;
};
