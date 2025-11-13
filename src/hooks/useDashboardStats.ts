'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { collection, collectionGroup, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

interface Stats {
  totalLeads: number;
  leadsToday: number;
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
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    leadsToday: 0,
    leadsOnline: 0,
    totalMessages: 0,
    completedConversations: 0,
    abandonedConversations: 0,
    completionRate: 0,
    usersWithDetails: [],
    averageConversationTime: '0m 0s',
  });
  const [isLoading, setIsLoading] = useState(true);
  const totalLeadsRef = useRef(0);

  useEffect(() => {
    if (!firestore) return;

    const fetchStats = async () => {
      setIsLoading(true);

      try {
        const usersCollectionRef = collection(firestore, 'users');
        const messagesCollectionGroup = collectionGroup(firestore, 'chat_messages');
        
        const [usersSnapshot, messagesSnapshot] = await Promise.all([
            getDocs(usersCollectionRef),
            getDocs(messagesCollectionGroup)
        ]);

        const totalLeads = usersSnapshot.size;

        if (totalLeads > totalLeadsRef.current && totalLeadsRef.current > 0) {
            toast({
                title: "🎉 Novo Lead Capturado!",
                description: `Um novo usuário iniciou a conversa. Total de leads: ${totalLeads}`,
            });
        }
        totalLeadsRef.current = totalLeads;

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
        let totalConversationSeconds = 0;
        let conversationsWithDuration = 0;
        let onlineCount = 0;
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const usersWithDetails = allUsers.map(user => {
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
            };
        }).sort((a, b) => {
            const aDate = a.lastInteraction ? (a.lastInteraction as Date).getTime() : 0;
            const bDate = b.lastInteraction ? (b.lastInteraction as Date).getTime() : 0;
            return bDate - aDate;
        });
        
        const avgSeconds = conversationsWithDuration > 0 ? totalConversationSeconds / conversationsWithDuration : 0;
        const duration = intervalToDuration({ start: 0, end: avgSeconds * 1000 });
        const averageConversationTime = `${duration.minutes || 0}m ${duration.seconds || 0}s`;

        const completedConversations = completedUserIds.size;
        const abandonedConversations = totalLeads - completedConversations;
        const completionRate = totalLeads > 0 ? (completedConversations / totalLeads) * 100 : 0;

        setStats({
          totalLeads,
          leadsToday,
          leadsOnline: onlineCount,
          totalMessages,
          completedConversations,
          abandonedConversations,
          completionRate,
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
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); 

    return () => clearInterval(interval);

  }, [firestore, toast]);

  return { stats, isLoading };
}
