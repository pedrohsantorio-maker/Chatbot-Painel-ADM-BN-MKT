'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { BarChart, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import UsersTable from '@/components/admin/UsersTable';

export default function AdminUsersPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);
  
  if (isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Carregando...</div>;
  }

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    router.push('/admin/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Admin
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
              <SidebarMenuButton>
                <MessageSquare />
                <span>Leads do Dia</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton isActive asChild>
                 <Link href="/admin/users">
                    <Users />
                    <span>Gerenciar Quiz</span>
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
             <h1 className="text-2xl font-bold">Gerenciar Quiz</h1>
          </div>
        </header>
        <main className="p-4 md:p-6">
            <UsersTable />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
