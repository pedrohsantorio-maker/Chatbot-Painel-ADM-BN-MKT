import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Phone, Video } from 'lucide-react';
import { Button } from '../ui/button';

export default function ChatHeader() {
  const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar');

  return (
    <header className="flex items-center p-3 border-b bg-card shadow-sm">
      <Avatar className="h-10 w-10 border-2 border-primary">
        {avatarImage && (
          <AvatarImage
            src={avatarImage.imageUrl}
            alt={avatarImage.description}
            data-ai-hint={avatarImage.imageHint}
          />
        )}
        <AvatarFallback>Gi</AvatarFallback>
      </Avatar>
      <div className="ml-3 flex-grow">
        <p className="font-semibold font-headline text-lg">Gi</p>
        <p className="text-sm text-muted-foreground">@gi_chatbot</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Video className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Phone className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
