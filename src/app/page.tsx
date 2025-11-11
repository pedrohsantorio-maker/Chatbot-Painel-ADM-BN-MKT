'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AgeGatePage() {
  return (
    <main className="flex h-full min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0c1a] via-[#100c1a] to-[#0d0a0f] z-0"></div>
       <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-pink-500/20 rounded-full blur-[150px] opacity-40 animate-pulse"></div>
       <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[150px] opacity-40 animate-pulse [animation-delay:2s]"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-12">
          Pronto para receber o melhor conteúdo?
        </h1>
        <Card className="w-full max-w-md text-center bg-[#1C1620] border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline text-white">
              Confirme sua idade
            </CardTitle>
            <CardDescription>
              Você deve ter 18 anos ou mais para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="secondary" size="lg" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold border-none w-full sm:w-auto flex-1">
              <Link href="/denied">Não sou maior de 18</Link>
            </Button>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full sm:w-auto flex-1">
              <Link href="/welcome">Sim, sou maior de 18</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
