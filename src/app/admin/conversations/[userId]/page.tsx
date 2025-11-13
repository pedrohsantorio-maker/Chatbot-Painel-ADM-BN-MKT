'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { BarChart, MessageSquare, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Message } from '@/lib/types';
import MessageBubble from '@/components/chat/MessageBubble';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminConversationDetailsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const firestore = useFirestore();

  const messagesCollectionRef = useMemoFirebase(() => 
    firestore && userId ? query(collection(firestore, `users/${userId}/chat_messages`), orderBy('timestamp', 'asc')) : null,
  [firestore, userId]);
  
  const { data: messages, isLoading: messagesLoading } = useCollection<Omit<Message, 'id'>>(messagesCollectionRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/admin/login');
  };

  if (isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Carregando...</div>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Chatbot
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/dashboard">
                    <BarChart />
                    <span>Visão Geral</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive asChild>
                 <Link href="/admin/users">
                    <Users />
                    <span>Leads</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/conversations">
                    <MessageSquare />
                    <span>Conversas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground">
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between border-b bg-background p-4">
          <div className="flex items-center gap-2">
             <SidebarTrigger className="md:hidden" />
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/users">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
             <div className="flex flex-col">
                <h1 className="text-2xl font-bold">Histórico de Conversa</h1>
                <p className="text-sm text-muted-foreground font-mono">{userId}</p>
             </div>
          </div>
        </header>
        <main className="p-4 md:p-6 h-[calc(100vh-81px)]">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col gap-4">
                     {messagesLoading ? (
                        <>
                            <Skeleton className="h-16 w-3/4 self-start rounded-3xl" />
                            <Skeleton className="h-12 w-1/2 self-end rounded-3xl" />
                            <Skeleton className="h-24 w-4/5 self-start rounded-3xl" />
                        </>
                     ) : messages && messages.length > 0 ? (
                        messages.map((message, index) => (
                           // @ts-ignore
                           <MessageBubble key={`${message.id}-${index}`} message={message} />
                        ))
                     ) : (
                        <p className="text-center text-muted-foreground">Nenhuma mensagem nesta conversa.</p>
                     )}
                    </div>
                </CardContent>
            </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
