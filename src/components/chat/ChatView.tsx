'use client';

import { useChat } from '@/lib/hooks/use-chat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function ChatView() {
  const { messages, isTyping, sendMessage, sendMediaMessage } = useChat();

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="w-full max-w-3xl mx-auto flex h-full flex-col">
        <ChatHeader />
        <MessageList messages={messages} isTyping={isTyping} />
        <ChatInput onSendMessage={sendMessage} onSendMedia={sendMediaMessage} />
      </div>
    </div>
  );
}
