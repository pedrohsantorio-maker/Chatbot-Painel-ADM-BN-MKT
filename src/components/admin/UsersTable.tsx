'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

interface UserData {
    id: string;
    email?: string;
    createdAt?: Timestamp | Date;
}

export default function UsersTable() {
  const firestore = useFirestore();
  const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserData>(usersCollectionRef);

  const formatDate = (date: Timestamp | Date | undefined) => {
    if (!date) return 'N/A';
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    return format(jsDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de Criação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
                </TableRow>
              ))
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>{user.email || 'Anônimo'}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Nenhum usuário encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
