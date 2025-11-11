'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeniedPage() {
  return (
    <main className="flex h-full min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center bg-card shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline text-destructive">
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Você precisa ter mais de 18 anos para acessar este conteúdo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Link href="/">Voltar</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
