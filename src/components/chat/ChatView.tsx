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
    if (message.trim()) {
      sendMessage(message.trim());
      setText('');
    }
  };

  const handleSelectReply = (reply: string) => {
    // Check for the free text hint, which shouldn't be sent
    if (reply === '(Livre digitação)') {
      return;
    }
    // Automatically send the reply
    handleSendMessage(reply);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="w-full max-w-3xl mx-auto flex h-full flex-col">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} isTyping={isTyping} />
        </div>
        <div className="px-3 md:px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-card border-t">
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
