'use client';

import type { Message } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useEffect, useRef } from 'react';

type MessageListProps = {
  messages: Message[];
  isTyping: boolean;
};

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  return (
    <ScrollArea className="flex-grow p-4" viewportRef={scrollAreaRef}>
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
}
