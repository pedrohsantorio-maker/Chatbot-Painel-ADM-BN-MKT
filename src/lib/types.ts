export type Message = {
  id: string;
  text?: string;
  sender: 'user' | 'bot';
  timestamp: number;
  type: 'text' | 'audio' | 'image' | 'video' | 'link';
  mediaUrl?: string;
  mediaMeta?: {
    duration?: string;
    fileName?: string;
    fileSize?: string;
  };
};
