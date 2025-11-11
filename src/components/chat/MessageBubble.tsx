'use client';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AudioPlayer from './AudioPlayer';
import { Button } from '../ui/button';
import { Link2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type MessageBubbleProps = {
  message: Message;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setTimeAgo(formatDistanceToNowStrict(message.timestamp, { addSuffix: true, locale: ptBR }));
    }
  }, [message.timestamp]);


  const renderContent = () => {
    switch (message.type) {
      case 'audio':
        return message.mediaUrl ? (
          <AudioPlayer src={message.mediaUrl} duration={message.mediaMeta?.duration} />
        ) : null;
      case 'link':
         return (
            <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <a href={message.text} target="_blank" rel="noopener noreferrer">
                    <Link2 className="mr-2 h-4 w-4" />
                    Abrir Link
                </a>
            </Button>
        );
      case 'image':
        return message.mediaUrl ? (
            <div className="relative w-64 h-64 rounded-lg overflow-hidden">
                 <Image src={message.mediaUrl} alt="Image sent by user" layout="fill" objectFit="cover" />
                 {message.text && <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">{message.text}</p>}
            </div>
        ) : null;
      default:
        return <p className="leading-relaxed break-words">{message.text}</p>;
    }
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className="flex flex-col gap-1 w-full max-w-md">
        <div
            className={cn(
            'rounded-3xl px-5 py-3 shadow-md',
            isUser
                ? 'bg-primary text-primary-foreground rounded-br-lg self-end'
                : 'bg-accent/50 text-accent-foreground rounded-bl-lg self-start'
            )}
        >
            <div className="break-words">{renderContent()}</div>
        </div>
        {timeAgo && (
          <p className={cn('text-xs', isUser ? 'text-right' : 'text-left', 'text-muted-foreground')}>
              {timeAgo}
          </p>
        )}
      </div>
    </div>
  );
}
