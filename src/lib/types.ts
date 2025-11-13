import { Timestamp } from "firebase/firestore";

export type Message = {
  id: string;
  text?: string;
  sender: 'user' | 'bot';
  timestamp: number | Timestamp;
  type: 'text' | 'audio' | 'image' | 'video' | 'link';
  mediaUrl?: string;
  mediaMeta?: {
    duration?: string;
    fileName?: string;
    fileSize?: string;
  };
  suggestions?: string[];
};


export interface UserDetails {
    id: string;
    email?: string;
    createdAt?: Timestamp | Date;
    lastInteraction?: Timestamp | Date;
    conversationStage?: string;
}
