export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  MATERIALS: '/api/materials',
} as const;

export const IMAGE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, 
  VALID_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
} as const;

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 2000,
  TYPING_DELAY: 1000,
  AUTO_SCROLL_DELAY: 100,
} as const;

export const MATERIALS_CONFIG = {
  MAX_MATERIALS_PER_REQUEST: 5,
  AVAILABLE_SUBJECTS: ['ekonomi', 'fisika'] as const,
  AVAILABLE_TYPES: ['video', 'article', 'book', 'course', 'exercise'] as const,
} as const;

export const ERROR_MESSAGES = {
  INVALID_MESSAGE: 'Format pesan tidak valid',
  SERVER_ERROR: 'Terjadi kesalahan saat memproses permintaan Anda',
  NETWORK_ERROR: 'Koneksi bermasalah. Silakan coba lagi.',
  IMAGE_TOO_LARGE: 'Ukuran gambar harus kurang dari 10MB',
  INVALID_IMAGE_TYPE: 'Silakan upload file gambar yang valid (JPG, PNG, GIF, atau WebP)',
  INVALID_API_KEY: 'Konfigurasi API tidak valid',
  NO_AI_RESPONSE: 'Tidak ada respons dari AI',
  MATERIALS_FETCH_ERROR: 'Gagal mengambil data materi',
  EMPTY_AFTER_TRIM: 'Pesan tidak boleh kosong atau hanya berisi spasi',
} as const;

export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Pesan berhasil dikirim',
  IMAGE_UPLOADED: 'Gambar berhasil diupload',
  MATERIALS_LOADED: 'Materi berhasil dimuat',
} as const;