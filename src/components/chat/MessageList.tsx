'use client';

import type { Message } from '@/lib/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useEffect, useRef } from 'react';

type MessageListProps = {
  messages: Message[];
  isTyping: boolean;
};

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const scrollViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewport.current) {
      scrollViewport.current.scrollTo({
        top: scrollViewport.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-grow p-4" ref={scrollViewport}>
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
}
