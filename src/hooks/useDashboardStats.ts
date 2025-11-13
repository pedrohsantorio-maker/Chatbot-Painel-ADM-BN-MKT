'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, collectionGroup, getDocs } from 'firebase/firestore';

interface Stats {
  totalLeads: number;
  totalMessages: number;
  completedConversations: number;
  abandonedConversations: number;
  completionRate: number;
}

interface ChatMessage {
    id: string;
    ref: {
        path: string;
    };
    type?: string;
}

export function useDashboardStats() {
  const firestore = useFirestore();
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalMessages: 0,
    completedConversations: 0,
    abandonedConversations: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchStats = async () => {
      setIsLoading(true);

      try {
        // 1. Get total leads
        const usersCollectionRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const totalLeads = usersSnapshot.size;

        // 2. Get all messages
        const messagesCollectionGroup = collectionGroup(firestore, 'chat_messages');
        const messagesSnapshot = await getDocs(messagesCollectionGroup);
        const totalMessages = messagesSnapshot.size;
        const allMessages: ChatMessage[] = messagesSnapshot.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }));

        // 3. Manually calculate completed conversations from all messages
        const completedUserIds = new Set<string>();
        allMessages.forEach(message => {
            if (message.type === 'link') {
                // Path is like users/{userId}/chat_messages/{messageId}
                const pathParts = message.ref.path.split('/');
                if (pathParts.length >= 2 && pathParts[0] === 'users') {
                    completedUserIds.add(pathParts[1]);
                }
            }
        });
        const completedConversations = completedUserIds.size;
        
        // 4. Calculate abandoned and completion rate
        const abandonedConversations = totalLeads - completedConversations;
        const completionRate = totalLeads > 0 ? (completedConversations / totalLeads) * 100 : 0;

        setStats({
          totalLeads,
          totalMessages,
          completedConversations,
          abandonedConversations,
          completionRate,
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);

  }, [firestore]);

  return { stats, isLoading };
}
