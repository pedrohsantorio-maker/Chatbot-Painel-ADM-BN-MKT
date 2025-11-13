'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, getDocs, query, where, Timestamp } from 'firebase/firestore';
import type { Message } from '@/lib/types';

interface Stats {
  totalLeads: number;
  totalMessages: number;
  completedConversations: number;
  abandonedConversations: number;
  completionRate: number;
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
        const userIds = usersSnapshot.docs.map(doc => doc.id);

        // 2. Get total messages
        const messagesCollectionGroup = collectionGroup(firestore, 'chat_messages');
        const messagesSnapshot = await getDocs(messagesCollectionGroup);
        const totalMessages = messagesSnapshot.size;

        // 3. Get completed conversations
        let completedConversations = 0;
        if (userIds.length > 0) {
            const completedUserIds = new Set<string>();

            // This query is now simpler and does not require a composite index.
            // Since only the bot sends 'link' type messages, the result is the same.
            const q = query(
                messagesCollectionGroup,
                where('type', '==', 'link')
            );

            const completedSnapshot = await getDocs(q);
            
            completedSnapshot.forEach(doc => {
                // path is like users/{userId}/chat_messages/{messageId}
                const pathParts = doc.ref.path.split('/');
                if (pathParts.length >= 2) {
                    completedUserIds.add(pathParts[1]);
                }
            });
            completedConversations = completedUserIds.size;
        }


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
