'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function WelcomePage() {
  return (
    <main className="flex h-full min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute inset-0 w-full h-full bg-background bg-[radial-gradient(hsl(var(--primary)/0.2)_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <Card className="w-full max-w-md text-center bg-card shadow-2xl z-10">
        <CardHeader>
          <div className="flex justify-center items-center mb-4">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">
            Bem-vinda!
          </CardTitle>
          <CardDescription className="text-lg">
            Prepare-se para uma conversa especial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg">
            <Link href="/chat">Falar com Gi</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
