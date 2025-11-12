'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Users, CheckCircle, MousePointerClick, TrendingUp, Hourglass } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function StatCards() {
  const isLoading = false; // Placeholder for future data fetching state

  const stats = [
    {
      title: "Total de Visitantes",
      value: "0",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Sem alteração"
    },
    {
      title: "Conclusões do Quiz",
      value: "0",
      icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
      description: "Sem alteração"
    },
    {
      title: "Cliques no Checkout",
      value: "0",
      icon: <MousePointerClick className="h-4 w-4 text-muted-foreground" />,
      description: "Sem alteração"
    },
    {
      title: "Taxa de Conversão",
      value: "0.00%",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "Sem alteração"
    },
    {
      title: "Tempo Médio Concluído",
      value: "0.00 min",
      icon: <Hourglass className="h-4 w-4 text-muted-foreground" />,
      description: "Sem alteração"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-1/2 mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
