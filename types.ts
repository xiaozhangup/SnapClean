
export interface EditedImage {
  id: string;
  originalUrl: string;
  editedUrl: string;
  prompt: string;
  timestamp: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  message: string;
}
