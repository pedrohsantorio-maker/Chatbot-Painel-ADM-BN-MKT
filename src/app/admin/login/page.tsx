'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('ghostzero355@gmail.com');
  const [password, setPassword] = useState('Senha123!');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Redirect if user is already logged in and auth is no longer loading
    if (!isUserLoading && user) {
      router.push('/admin/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Erro de Inicialização",
            description: "Os serviços do Firebase não estão disponíveis. Tente novamente mais tarde.",
        });
        return;
    }

    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login bem-sucedido',
        description: 'Redirecionando para o dashboard.',
      });
      // The useEffect will handle the redirect, but we can also push here.
      router.push('/admin/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        // If user does not exist, try to create a new admin user
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const newUser = userCredential.user;

          // Set the admin role in Firestore
          const adminRoleRef = doc(firestore, 'roles_admin', newUser.uid);
          await setDoc(adminRoleRef, {
            email: newUser.email,
            createdAt: serverTimestamp(),
          });
          
          toast({
            title: 'Conta de Administrador Criada',
            description:
              'Sua conta foi criada e você tem privilégios de administrador.',
          });
          router.push('/admin/dashboard');
        } catch (creationError: any) {
          toast({
            variant: 'destructive',
            title: 'Falha na Criação da Conta',
            description:
              creationError.message ||
              'Não foi possível criar a conta de administrador.',
          });
        }
      } else {
        // Handle other login errors (e.g., wrong password, network errors)
        toast({
          variant: 'destructive',
          title: 'Falha no login',
          description: 'Email ou senha inválidos. Tente novamente.',
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // While checking auth state, show a loading screen, but don't render the form.
  if (isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Carregando...</div>;
  }
  
  // If user is logged in, this will be handled by useEffect redirect, but as a fallback, don't render the form.
  if (user) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Redirecionando...</div>;
  }

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login do Administrador</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
