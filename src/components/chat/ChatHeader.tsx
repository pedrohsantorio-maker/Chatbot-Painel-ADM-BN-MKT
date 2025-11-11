'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogOverlay,
  DialogClose
} from "@/components/ui/dialog";
import Image from 'next/image';

export default function ChatHeader() {
  const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar');

  return (
    <header className="flex items-center p-3 border-b bg-card shadow-sm sticky top-0 z-10">
      <Button variant="ghost" size="icon" className="rounded-full mr-2" asChild>
        <Link href="/welcome">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
      </Button>
      
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full ring-offset-background">
            <Avatar className="h-10 w-10 border-2 border-primary cursor-pointer">
              {avatarImage && (
                <AvatarImage
                  src={avatarImage.imageUrl}
                  alt={avatarImage.description}
                  data-ai-hint={avatarImage.imageHint}
                />
              )}
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </button>
        </DialogTrigger>
        <div className="ml-3 flex-grow">
          <p className="font-semibold font-headline text-lg">Ster</p>
          <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
        <DialogContent className="bg-transparent border-none shadow-none p-0 w-auto max-w-[90vw] sm:max-w-lg">
           <DialogOverlay className="bg-black/80" />
            {avatarImage && (
              <div className="relative">
                <Image
                    src={avatarImage.imageUrl}
                    alt={avatarImage.description}
                    width={500}
                    height={500}
                    className="rounded-lg object-contain w-full h-auto max-h-[80vh]"
                />
                 <DialogClose className="absolute -top-2 -right-2 rounded-full bg-background/80 text-foreground p-1 opacity-100 hover:opacity-80 transition-opacity">
                    <X className="h-5 w-5" />
                 </DialogClose>
              </div>
            )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
      </div>
    </header>
  );
}
