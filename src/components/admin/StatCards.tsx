'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, TrendingUp, CalendarCheck, Clock, Wifi } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useDashboardStats } from '@/hooks/useDashboardStats';

type StatCardsProps = {
    selectedDate: Date;
}

export default function StatCards({ selectedDate }: StatCardsProps) {
  const { stats, isLoading } = useDashboardStats(selectedDate);

  const statItems = [
    {
      title: "Leads Totais",
      value: stats.totalLeads,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Total de pessoas que iniciaram"
    },
    {
        title: `Leads em ${selectedDate.toLocaleDateString()}`,
        value: stats.leadsOnDate,
        icon: <CalendarCheck className="h-4 w-4 text-muted-foreground" />,
        description: "Novos leads na data selecionada"
    },
    {
      title: "Leads Online",
      value: stats.leadsOnline,
      icon: <Wifi className="h-4 w-4 text-green-500" />,
      description: "Usuários ativos nos últimos 5 min"
    },
    {
      title: "Conversas Concluídas",
      value: stats.completedConversations,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      description: "Leads que clicaram no link final"
    },
     {
      title: "Conversas Abandonadas",
      value: stats.abandonedConversations,
      icon: <XCircle className="h-4 w-4 text-destructive" />,
      description: "Leads que não finalizaram"
    },
    {
      title: "Taxa de Conversão",
      value: `${stats.completionRate.toFixed(1)}%`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "Percentual de leads que concluíram"
    },
     {
      title: "Tempo Médio",
      value: stats.averageConversationTime,
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      description: "Duração média das conversas"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {statItems.map((stat, index) => (
        <Card key={index} className="animate-in fade-in-0">
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
