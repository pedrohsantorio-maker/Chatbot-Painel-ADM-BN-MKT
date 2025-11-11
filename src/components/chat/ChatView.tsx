'use client';

import { useChat } from '@/lib/hooks/use-chat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import SuggestedReplies from './SuggestedReplies';
import { useState } from 'react';

export default function ChatView() {
  const { messages, isTyping, suggestions, sendMessage, sendMediaMessage, isSending } = useChat();
  const [text, setText] = useState('');

  const handleSendMessage = (message: string) => {
    sendMessage(message);
    setText('');
  };

  const handleSelectReply = (reply: string) => {
    setText(reply);
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="w-full max-w-3xl mx-auto flex h-full flex-col">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} isTyping={isTyping} />
        </div>
        <div className="p-3 border-t bg-card">
          <SuggestedReplies suggestions={suggestions} onSelectReply={handleSelectReply} />
          <ChatInput 
            text={text}
            setText={setText}
            onSendMessage={handleSendMessage} 
            onSendMedia={sendMediaMessage}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
}
