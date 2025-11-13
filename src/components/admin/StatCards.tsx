'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, CheckCircle, XCircle, TrendingUp, CalendarCheck } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function StatCards() {
  const { stats, isLoading } = useDashboardStats();

  const statItems = [
    {
      title: "Leads Totais",
      value: stats.totalLeads,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Total de pessoas que iniciaram"
    },
    {
        title: "Leads Hoje",
        value: stats.leadsToday,
        icon: <CalendarCheck className="h-4 w-4 text-muted-foreground" />,
        description: "Novos leads nas últimas 24h"
    },
    {
      title: "Mensagens Trocadas",
      value: stats.totalMessages,
      icon: <MessageSquare className="h-4 w-4 text-muted-foreground" />,
      description: "Usuário + Bot"
    },
    {
      title: "Conversas Concluídas",
      value: stats.completedConversations,
      icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
      description: "Chegaram à última etapa"
    },
    {
      title: "Taxa de Conclusão",
      value: `${stats.completionRate.toFixed(2)}%`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "(Concluídas / Iniciadas)"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statItems.map((stat, index) => (
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
