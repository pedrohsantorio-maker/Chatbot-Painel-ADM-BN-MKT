'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, MessageSquare } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function StatCards() {
  const firestore = useFirestore();
  const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection(usersCollectionRef);

  const [totalMessages, setTotalMessages] = useState(0);
  const [messagesLoading, setMessagesLoading] = useState(true);

  useEffect(() => {
    async function fetchMessageCounts() {
      if (!firestore || !users) {
        if (!usersLoading) {
            setMessagesLoading(false);
        }
        return;
      }
      
      setMessagesLoading(true);
      let messageCount = 0;
      
      try {
        for (const user of users) {
          const messagesRef = collection(firestore, `users/${user.id}/chat_messages`);
          const messagesSnapshot = await getDocs(query(messagesRef));
          messageCount += messagesSnapshot.size;
        }
        setTotalMessages(messageCount);
      } catch (error) {
        console.error("Failed to fetch message counts:", error);
      } finally {
        setMessagesLoading(false);
      }
    }

    fetchMessageCounts();
  }, [firestore, users, usersLoading]);

  const totalUsers = users?.length ?? 0;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <Skeleton className="h-8 w-1/4" />
          ) : (
            <div className="text-2xl font-bold">{totalUsers}</div>
          )}
          <p className="text-xs text-muted-foreground">Usuários únicos que iniciaram o chat.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {messagesLoading ? (
            <Skeleton className="h-8 w-1/4" />
          ) : (
            <div className="text-2xl font-bold">{totalMessages}</div>
          )}
          <p className="text-xs text-muted-foreground">Soma de todas as mensagens trocadas.</p>
        </CardContent>
      </Card>
    </div>
  );
}
