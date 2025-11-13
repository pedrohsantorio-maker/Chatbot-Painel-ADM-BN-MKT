'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { collection, collectionGroup, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { differenceInSeconds, intervalToDuration, isSameDay, startOfDay, endOfDay } from 'date-fns';

interface Stats {
  totalLeads: number;
  leadsOnDate: number;
  leadsOnline: number;
  totalMessages: number;
  completedConversations: number;
  abandonedConversations: number;
  completionRate: number;
  usersWithDetails: UserDetails[];
  averageConversationTime: string;
}

interface UserDetails {
    id: string;
    email?: string;
    createdAt?: Timestamp | Date;
    lastInteraction?: Timestamp | Date;
    conversationStage?: string;
    dailyLeadNumber?: number;
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

export function useDashboardStats(selectedDate: Date) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    leadsOnDate: 0,
    leadsOnline: 0,
    totalMessages: 0,
    completedConversations: 0,
    abandonedConversations: 0,
    completionRate: 0,
    usersWithDetails: [],
    averageConversationTime: '0m 0s',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
      if (!firestore) return;
      setIsLoading(true);

      try {
        const usersCollectionRef = collection(firestore, 'users');
        const messagesCollectionGroup = collectionGroup(firestore, 'chat_messages');
        
        const [usersSnapshot, messagesSnapshot] = await Promise.all([
            getDocs(usersCollectionRef),
            getDocs(messagesCollectionGroup)
        ]);

        const totalLeads = usersSnapshot.size;

        const allUsers: UserDetails[] = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        const now = new Date();
        const startOfSelectedDate = startOfDay(selectedDate);
        const endOfSelectedDate = endOfDay(selectedDate);

        const leadsOnDate = allUsers.filter(user => {
            if (!user.createdAt) return false;
            const createdAtDate = user.createdAt instanceof Timestamp ? user.createdAt.toDate() : user.createdAt;
            return createdAtDate >= startOfSelectedDate && createdAtDate <= endOfSelectedDate;
        });

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
        let totalConversationSeconds = 0;
        let conversationsWithDuration = 0;
        let onlineCount = 0;
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const usersForDate = allUsers.filter(user => {
           if (!user.createdAt) return false;
           const createdAtDate = user.createdAt instanceof Timestamp ? user.createdAt.toDate() : user.createdAt;
           return isSameDay(createdAtDate, selectedDate);
        }).sort((a,b) => {
            const aDate = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : (a.createdAt as Date).getTime();
            const bDate = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : (b.createdAt as Date).getTime();
            return aDate - bDate;
        })
        
        const usersWithDetails = usersForDate.map((user, index) => {
            const userMessages = messagesByUser.get(user.id) || [];
            let lastInteractionTime: Date | undefined;

            if (userMessages.length > 0) {
              userMessages.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
              const firstMessageTime = userMessages[0].timestamp.toDate();
              const lastMessageTime = userMessages[userMessages.length - 1].timestamp.toDate();
              lastInteractionTime = lastMessageTime;
              
              if(userMessages.length > 1) {
                  totalConversationSeconds += differenceInSeconds(lastMessageTime, firstMessageTime);
                  conversationsWithDuration++;
              }
               if (lastInteractionTime > fiveMinutesAgo) {
                    onlineCount++;
                }
            }

            const lastBotMessage = [...userMessages].reverse().find(m => m.sender === 'bot');

            const hasCompleted = userMessages.some(m => m.type === 'link');
            if (hasCompleted) {
                completedUserIds.add(user.id);
            }

            return {
                ...user,
                lastInteraction: lastInteractionTime,
                conversationStage: hasCompleted ? 'Concluída' : getStageFromMessage(lastBotMessage?.text),
                dailyLeadNumber: index + 1
            };
        });
        
        const avgSeconds = conversationsWithDuration > 0 ? totalConversationSeconds / conversationsWithDuration : 0;
        const duration = intervalToDuration({ start: 0, end: avgSeconds * 1000 });
        const averageConversationTime = `${duration.minutes || 0}m ${duration.seconds || 0}s`;

        const completedConversationsOnDate = usersWithDetails.filter(u => u.conversationStage === 'Concluída').length;
        const leadsOnDateCount = usersWithDetails.length;
        const abandonedConversationsOnDate = leadsOnDateCount - completedConversationsOnDate;
        const completionRateOnDate = leadsOnDateCount > 0 ? (completedConversationsOnDate / leadsOnDateCount) * 100 : 0;

        setStats({
          totalLeads,
          leadsOnDate: leadsOnDateCount,
          leadsOnline: onlineCount,
          totalMessages,
          completedConversations: completedConversationsOnDate,
          abandonedConversations: abandonedConversationsOnDate,
          completionRate: completionRateOnDate,
          usersWithDetails,
          averageConversationTime
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
    }, [firestore, toast, selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => fetchStats(), 5000); 
    fetchStats(); // Initial fetch
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, isLoading, refetchStats: fetchStats };
}
