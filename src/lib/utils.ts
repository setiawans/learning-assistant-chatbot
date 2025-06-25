import { v4 as uuidv4 } from "uuid";

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
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Silakan upload file gambar yang valid (JPG, PNG, GIF, atau WebP)' 
    };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Ukuran gambar harus kurang dari 10MB'
    };
  }

  return { valid: true };
}