'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function WelcomePage() {
  return (
    <main className="flex h-full min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0c1a] via-[#100c1a] to-[#0d0a0f] z-0"></div>
       <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-pink-500/20 rounded-full blur-[150px] opacity-40 animate-pulse"></div>
       <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[150px] opacity-40 animate-pulse [animation-delay:2s]"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <Card className="w-full max-w-md text-center bg-black border-none shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-center items-center mb-4">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <CardDescription className="text-lg text-muted-foreground">
              Prepare-se para uma conversa especial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg">
              <Link href="/chat">Falar com Gi</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
