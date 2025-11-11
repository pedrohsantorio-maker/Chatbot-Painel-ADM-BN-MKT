import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft, Phone, Video } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function ChatHeader() {
  const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar');

  return (
    <header className="flex items-center p-3 border-b bg-card shadow-sm sticky top-0 z-10">
      <Button variant="ghost" size="icon" className="rounded-full mr-2" asChild>
        <Link href="/welcome">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
      </Button>
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
        <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            <p className="text-sm text-muted-foreground">Online</p>
        </div>
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
