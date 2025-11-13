'use client';

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNowStrict, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp, writeBatch } from 'firebase/firestore';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useToast } from '../ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type UsersTableProps = {
    selectedDate: Date;
}

export default function UsersTable({ selectedDate }: UsersTableProps) {
  const { stats, isLoading, refetchStats } = useDashboardStats(selectedDate);
  const firestore = useFirestore();
  const { toast } = useToast();

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

  const getStageVariant = (stage?: string): 'default' | 'secondary' | 'outline' => {
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

  const handleDeleteHistory = async (userId: string) => {
    if (!firestore) return;
    try {
      const messagesRef = collection(firestore, `users/${userId}/chat_messages`);
      const querySnapshot = await getDocs(messagesRef);
      if (querySnapshot.empty) {
        toast({ title: "Nenhuma conversa para apagar." });
        return;
      }
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();
      toast({
        title: "Histórico Apagado!",
        description: `O histórico de mensagens do lead ${userId.substring(0, 5)}... foi apagado.`,
      });
      refetchStats(); // Refetch stats after deletion
    } catch (error: any) {
      console.error("Error deleting chat history: ", error);
      toast({
        variant: 'destructive',
        title: "Erro ao Apagar",
        description: "Não foi possível apagar o histórico de conversas.",
      });
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead do Dia</TableHead>
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
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
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
                <TableRow key={user.id} className="animate-in fade-in-0">
                  <TableCell className="font-bold">Lead {user.dailyLeadNumber}</TableCell>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>{user.email || 'Anônimo'}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatTimeAgo(user.lastInteraction)}</TableCell>
                  <TableCell>
                    <Badge variant={getStageVariant(user.conversationStage)} className={cn(getStageVariant(user.conversationStage) === 'default' && 'bg-green-600/90 text-white')}>
                      {user.conversationStage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/conversations/${user.id}`}>
                            Ver Conversa
                        </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Apagar Histórico</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso apagará permanentemente
                            o histórico de conversas deste lead.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteHistory(user.id)}>
                            Apagar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Nenhum usuário encontrado para esta data.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
