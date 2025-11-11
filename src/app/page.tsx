'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AgeGatePage() {
  return (
    <main className="flex h-full min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10" />
      <div className="relative z-20">
        <Card className="w-full max-w-md text-center bg-card shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline">
              Você tem mais de 18 anos?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <Link href="/welcome">Sim</Link>
            </Button>
            <Button asChild variant="destructive" size="lg" className="bg-primary/80 hover:bg-primary font-bold">
              <Link href="/denied">Não</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
