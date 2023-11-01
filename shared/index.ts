export interface DocumentChange {
  id: string;
  content: string;
  filePath: string;
  timestamp: number;
}

export interface Completion {
  id: string;
  completion: string;
  timestamp: number;
  input: string;
  accepted: boolean;
  acceptedTimestamp?: number;
  language: string;
}

export interface User {
  id: string;
}
