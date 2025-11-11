'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AgeGatePage() {
  return (
    <main className="flex h-full min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-black z-0"></div>
       <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[150px] opacity-40 animate-pulse"></div>
       <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[150px] opacity-40 animate-pulse [animation-delay:2s]"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-12">
          Pronto para receber o melhor conteúdo?😈
        </h1>
        <Card className="w-full max-w-md text-center bg-card/80 border-border shadow-2xl backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline text-foreground">
              Confirme sua idade
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Você deve ter 18 anos ou mais para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="secondary" size="lg" className="bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground font-bold border-none flex-1 h-14 text-base">
              <Link href="/denied">Não sou maior de 18</Link>
            </Button>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex-1 h-14 text-base">
              <Link href="/welcome">Sim, sou maior de 18😈</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
