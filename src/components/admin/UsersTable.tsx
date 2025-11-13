'use client';

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNowStrict, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


export default function UsersTable() {
  const { stats, isLoading } = useDashboardStats();

  const formatDate = (date: Timestamp | Date | undefined) => {
    if (!date) return 'N/A';
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    return format(jsDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  const formatTimeAgo = (date: Timestamp | Date | undefined) => {
    if (!date) return 'N/A';
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    const isRecent = differenceInSeconds(new Date(), jsDate) < 30;

    return (
        <div className="flex items-center gap-2">
            {isRecent && <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>}
            <span>{formatDistanceToNowStrict(jsDate, { addSuffix: true, locale: ptBR })}</span>
        </div>
    )
  }

  const getStageVariant = (stage?: string) => {
    switch(stage) {
        case 'Concluída':
            return 'default';
        case 'Iniciou':
        case 'Aguardando Presente':
        case 'Aguardando Avaliação':
        case 'Aguardando Mais':
        case 'Confirmação Final':
            return 'secondary';
        default:
            return 'outline';
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Última Interação</TableHead>
              <TableHead>Etapa da Conversa</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-2/3" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 float-right" /></TableCell>
                </TableRow>
              ))
            ) : stats.usersWithDetails && stats.usersWithDetails.length > 0 ? (
              stats.usersWithDetails.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>{user.email || 'Anônimo'}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatTimeAgo(user.lastInteraction)}</TableCell>
                  <TableCell>
                    <Badge variant={getStageVariant(user.conversationStage)}>{user.conversationStage}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/conversations/${user.id}`}>
                            Ver Conversa
                        </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Nenhum usuário encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
