'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      // Simple check if user is logged in, admin role will be checked on dashboard
      router.push('/admin/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try to sign in first
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, the useEffect will redirect to dashboard
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // If user does not exist, create a new account
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const newUser = userCredential.user;

          // Add user to the admin roles collection in Firestore
          if (firestore && newUser) {
            const adminRoleRef = doc(firestore, 'roles_admin', newUser.uid);
            await setDoc(adminRoleRef, {
              email: newUser.email,
              createdAt: new Date(),
            });
            toast({
              title: 'Conta de Administrador Criada',
              description:
                'Sua conta foi criada e você tem privilégios de administrador.',
            });
          }
          // The useEffect will handle redirection after state change
        } catch (creationError: any) {
          toast({
            variant: 'destructive',
            title: 'Falha na Criação da Conta',
            description:
              creationError.message ||
              'Não foi possível criar a conta de administrador.',
          });
          setIsLoading(false);
        }
      } else {
        // Handle other login errors
        toast({
          variant: 'destructive',
          title: 'Falha no login',
          description: 'Email ou senha inválidos. Tente novamente.',
        });
        setIsLoading(false);
      }
    }
    // Don't set isLoading to false here, redirection or a final toast will happen
  };

  // The loading and logged-in state is handled by the redirect in useEffect.
  // Rendering a consistent component on both server and client avoids hydration errors.
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isUserLoading}>
              {isLoading || isUserLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
