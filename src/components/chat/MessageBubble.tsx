import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import AudioPlayer from './AudioPlayer';
import { Button } from '../ui/button';
import { Link2 } from 'lucide-react';
import Image from 'next/image';

type MessageBubbleProps = {
  message: Message;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

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
        return <p className="leading-relaxed">{message.text}</p>;
    }
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-md rounded-xl px-4 py-3 shadow',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none'
        )}
      >
        <div className="break-words">{renderContent()}</div>
        <p className={cn('text-xs mt-2', isUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
          {format(message.timestamp, 'HH:mm')}
        </p>
      </div>
    </div>
  );
}
