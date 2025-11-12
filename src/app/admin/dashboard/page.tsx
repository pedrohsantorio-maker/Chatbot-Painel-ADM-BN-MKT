'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { BarChart, MessageSquare, Users, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCards from '@/components/admin/StatCards';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminDashboard() {
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
              <SidebarMenuButton isActive asChild>
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
              <SidebarMenuButton asChild>
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
        <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-background p-4">
          <div className="flex items-center gap-2">
             <SidebarTrigger className="md:hidden" />
             <h1 className="text-2xl font-bold">Painel de Admin</h1>
          </div>
           <div className="flex items-center gap-2">
            <Button variant="outline">Hoje</Button>
            <Button variant="ghost">Ontem</Button>
            <Button variant="ghost">7 dias</Button>
            <Button variant="ghost">30 dias</Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Período</span>
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6 space-y-6">
            <StatCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Visitas Diárias</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center">
                            <p className="text-muted-foreground">Gráfico de visitas diárias</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Origem do Tráfego</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center">
                            <p className="text-muted-foreground">Gráfico de origem do tráfego</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Pontos de Desistência</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-40 w-full bg-muted/50 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Etapas onde os usuários saíram do quiz</p>
                    </div>
                </CardContent>
            </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
