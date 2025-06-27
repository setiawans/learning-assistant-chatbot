import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { validateImageFile, fileToBase64 } from '@/lib/utils';
import { CHAT_CONFIG, ERROR_MESSAGES } from '@/lib/constants';
import Image from 'next/image';

interface ChatInputProps {
  onSendMessage: (message: string, image?: string) => void;
  disabled?: boolean;
  initialImage?: string | null;
  onImageCleared?: () => void;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  initialImage = null,
  onImageCleared
}: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialImage) {
      setSelectedImage(initialImage);
    }
  }, [initialImage]);

  const clearError = useCallback(() => setError(null), []);
  
  const resetForm = useCallback(() => {
    setInputText('');
    setSelectedImage(null);
    clearError();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (onImageCleared) {
      onImageCleared();
    }
  }, [clearError, onImageCleared]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = window.innerWidth < 768 ? 200 : 300;
    const newHeight = Math.min(scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim() && !selectedImage) return;
    
    if (inputText.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
      setError(`Pesan terlalu panjang. Maksimal ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} karakter.`);
      return;
    }
    
    onSendMessage(inputText, selectedImage || undefined);
    resetForm();
  }, [inputText, selectedImage, onSendMessage, resetForm]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleImageSelect = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || ERROR_MESSAGES.INVALID_IMAGE_TYPE);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
      clearError();
    } catch {
      setError(ERROR_MESSAGES.INVALID_IMAGE_TYPE);
    }
  }, [clearError]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageSelect(file);
        }
        break;
      }
    }
  }, [handleImageSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    clearError();
    if (onImageCleared) {
      onImageCleared();
    }
  }, [clearError, onImageCleared]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (error) clearError();
    setTimeout(adjustTextareaHeight, 0);
  }, [error, clearError, adjustTextareaHeight]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener('paste', handlePaste);
    const handleResize = () => adjustTextareaHeight();
    window.addEventListener('resize', handleResize);
    
    return () => {
      textarea.removeEventListener('paste', handlePaste);
      window.removeEventListener('resize', handleResize);
    };
  }, [handlePaste, adjustTextareaHeight]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText, adjustTextareaHeight]);

  const isSubmitDisabled = disabled || (!inputText.trim() && !selectedImage);
  const borderClass = isDragOver 
    ? 'border-cyan-400 bg-slate-700/80' 
    : 'border-slate-700/50 hover:border-slate-600/50';

  return (
    <div className="bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {selectedImage && <ImagePreview src={selectedImage} onRemove={removeImage} />}

        <div 
          className={`relative bg-slate-800/80 backdrop-blur-sm border rounded-2xl transition-all duration-300 ${borderClass}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex items-end gap-3 p-4">
            <ImageUploadButton onClick={openFileDialog} disabled={disabled} />

            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Lagi butuh bantuan apa sobat? Jangan masukkan data pribadi kamu yaa!"
                className="w-full bg-transparent text-white placeholder-slate-400 resize-none focus:outline-none min-h-[24px] max-h-[200px] md:max-h-[300px] overflow-y-auto scrollbar-custom pr-2"
                rows={1}
                disabled={disabled}
                maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
              />
              <CharacterCounter current={inputText.length} max={CHAT_CONFIG.MAX_MESSAGE_LENGTH} />
            </div>

            <SendButton onClick={handleSend} disabled={isSubmitDisabled} />
          </div>

          {isDragOver && <DragOverlay />}
        </div>

        <DisclaimerText />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}

const ImagePreview = ({ src, onRemove }: { src: string; onRemove: () => void }) => (
  <div className="mb-4 flex justify-center">
    <div className="relative inline-block">
      <Image 
        src={src} 
        alt="Selected image preview" 
        width={200}
        height={128}
        className="max-w-xs max-h-32 rounded-lg border border-slate-600 object-contain"
      />
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
        aria-label="Remove image"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  </div>
);

const ImageUploadButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0 w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center transition-colors"
    disabled={disabled}
    aria-label="Upload image"
  >
    <ImageIcon className="w-5 h-5 text-slate-400" />
  </button>
);

const CharacterCounter = ({ current, max }: { current: number; max: number }) => (
  <div className="text-xs text-slate-500 mt-1">
    {current}/{max}
  </div>
);

const SendButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
    aria-label="Send message"
  >
    <Send className="w-5 h-5 text-white" />
  </button>
);

const DragOverlay = () => (
  <div className="absolute inset-0 bg-cyan-400/10 border-2 border-dashed border-cyan-400 rounded-2xl flex items-center justify-center">
    <p className="text-cyan-400 font-medium">Drop your image here</p>
  </div>
);

const DisclaimerText = () => (
  <p className="text-xs text-slate-500 text-center mt-3">
    *Copilot bisa salah, tolong cek lagi yaa!
  </p>
);