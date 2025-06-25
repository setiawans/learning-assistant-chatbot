import { v4 as uuidv4 } from "uuid";
import { FileValidationResult } from "./types";
import { IMAGE_CONFIG, ERROR_MESSAGES } from "./constants";

export function generateId(): string {
  return uuidv4();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

function isValidImageType(mimeType: string): boolean {
  return (IMAGE_CONFIG.VALID_TYPES as readonly string[]).includes(mimeType);
}

export function validateImageFile(file: File): FileValidationResult {
  if (!isValidImageType(file.type)) {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.INVALID_IMAGE_TYPE
    };
  }

  if (file.size > IMAGE_CONFIG.MAX_SIZE) {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.IMAGE_TOO_LARGE
    };
  }

  return { valid: true };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}