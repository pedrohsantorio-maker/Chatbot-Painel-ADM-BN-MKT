'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { collection, collectionGroup, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

interface Stats {
  totalLeads: number;
  leadsToday: number;
  totalMessages: number;
  completedConversations: number;
  abandonedConversations: number;
  completionRate: number;
  usersWithDetails: UserDetails[];
}

interface UserDetails {
    id: string;
    email?: string;
    createdAt?: Timestamp | Date;
    lastInteraction?: Timestamp | Date;
    conversationStage?: string;
}

interface ChatMessage {
    id: string;
    ref: {
        path: string;
    };
    text?: string;
    type?: string;
    sender?: 'bot' | 'user';
    timestamp: Timestamp;
}

const getStageFromMessage = (message?: string): string => {
    if (!message) return 'Iniciada';
    if (message.includes('como você tá?')) return 'Iniciou';
    if (message.includes('presentinho?')) return 'Aguardando Presente';
    if (message.includes('gostou?')) return 'Aguardando Avaliação';
    if (message.includes('quer mais?')) return 'Aguardando Mais';
    if (message.includes('inteirinha pra você?')) return 'Confirmação Final';
    if (message.includes('Estou te esperando')) return 'Concluída';
    return 'Em Andamento';
}

export function useDashboardStats() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isFetchedRef = useRef(false);
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    leadsToday: 0,
    totalMessages: 0,
    completedConversations: 0,
    abandonedConversations: 0,
    completionRate: 0,
    usersWithDetails: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || isFetchedRef.current) return;
    isFetchedRef.current = true; // Prevents re-fetching

    const fetchStats = async () => {
      setIsLoading(true); 

      try {
        // Fetch users and messages concurrently
        const usersCollectionRef = collection(firestore, 'users');
        const messagesCollectionGroup = collectionGroup(firestore, 'chat_messages');
        
        const [usersSnapshot, messagesSnapshot] = await Promise.all([
            getDocs(usersCollectionRef),
            getDocs(messagesCollectionGroup)
        ]);

        const totalLeads = usersSnapshot.size;

        const allUsers: UserDetails[] = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const leadsToday = allUsers.filter(user => {
            if (!user.createdAt) return false;
            const createdAtDate = user.createdAt instanceof Timestamp ? user.createdAt.toDate() : user.createdAt;
            return createdAtDate > twentyFourHoursAgo;
        }).length;

        const totalMessages = messagesSnapshot.size;
        const allMessages: ChatMessage[] = messagesSnapshot.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() as any }));

        const messagesByUser = new Map<string, ChatMessage[]>();
        allMessages.forEach(message => {
            const userId = message.ref.path.split('/')[1];
            if (!messagesByUser.has(userId)) {
                messagesByUser.set(userId, []);
            }
            messagesByUser.get(userId)!.push(message);
        });

        const completedUserIds = new Set<string>();
        const usersWithDetails = allUsers.map(user => {
            const userMessages = messagesByUser.get(user.id) || [];
            userMessages.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
            
            const lastMessage = userMessages[0];
            const lastBotMessage = userMessages.find(m => m.sender === 'bot');

            const hasCompleted = userMessages.some(m => m.type === 'link');
            if (hasCompleted) {
                completedUserIds.add(user.id);
            }

            return {
                ...user,
                lastInteraction: lastMessage?.timestamp,
                conversationStage: hasCompleted ? 'Concluída' : getStageFromMessage(lastBotMessage?.text),
            };
        }).sort((a, b) => {
            const aDate = a.lastInteraction ? (a.lastInteraction as Timestamp).toMillis() : 0;
            const bDate = b.lastInteraction ? (b.lastInteraction as Timestamp).toMillis() : 0;
            return bDate - aDate;
        });

        const completedConversations = completedUserIds.size;
        const abandonedConversations = totalLeads - completedConversations;
        const completionRate = totalLeads > 0 ? (completedConversations / totalLeads) * 100 : 0;

        setStats({
          totalLeads,
          leadsToday,
          totalMessages,
          completedConversations,
          abandonedConversations,
          completionRate,
          usersWithDetails,
        });

      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
         toast({
            variant: "destructive",
            title: "Erro ao buscar dados",
            description: error.message || 'Não foi possível carregar as estatísticas do painel.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

  }, [firestore, toast]);

  return { stats, isLoading };
}
