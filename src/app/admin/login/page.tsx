'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, Firestore, addDoc, collection } from 'firebase/firestore';
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

const logAdminLogin = async (firestore: Firestore, user: User) => {
    try {
        const logCollection = collection(firestore, 'admin_logs');
        await addDoc(logCollection, {
            adminId: user.uid,
            email: user.email,
            action: 'ADMIN_LOGIN',
            timestamp: serverTimestamp(),
            details: 'Admin successfully logged into the dashboard.'
        });
    } catch (error) {
        console.error("Error logging admin login: ", error);
        // We don't toast this error as it's a background task
    }
}

export default function LoginPage() {
  const [email, setEmail] = useState('ghostzero355@gmail.com');
  const [password, setPassword] = useState('Senha123!');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  // State to ensure Firebase services are ready before allowing login.
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Firebase services are ready when they are not null.
    if (auth && firestore) {
      setFirebaseReady(true);
    }
  }, [auth, firestore]);

  useEffect(() => {
    // Redirect if user is already logged in and auth check is complete.
    if (!isUserLoading && user) {
      router.push('/admin/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLoginSuccess = async (user: User) => {
    if(firestore) {
        await logAdminLogin(firestore, user);
    }
    router.push('/admin/dashboard');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-check services are available before proceeding.
    if (!firebaseReady || !auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Aguarde um momento",
            description: "Os serviços de autenticação ainda estão carregando. Tente novamente em breve.",
        });
        return;
    }

    setIsLoggingIn(true);

    try {
      // Try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(userCredential.user);
    } catch (error: any) {
      // If user does not exist, try to create a new admin user
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
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
            description: 'Sua conta foi criada e você tem privilégios de administrador.',
          });
          await handleLoginSuccess(newUser);
        } catch (creationError: any) {
          toast({
            variant: 'destructive',
            title: 'Falha na Criação da Conta',
            description: creationError.message || 'Não foi possível criar a conta de administrador.',
          });
        }
      } else {
        // Handle other login errors (e.g., wrong password, network errors)
        toast({
          variant: 'destructive',
          title: 'Falha no login',
          description: error.message || 'Email ou senha inválidos. Tente novamente.',
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // While checking auth state or if firebase services are not ready, show a loading screen.
  if (isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Carregando...</div>;
  }
  
  // If user is already logged in, the useEffect will handle the redirect.
  // This prevents a flash of the login form.
  if (user) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Redirecionando...</div>;
  }
  
  const isButtonDisabled = isLoggingIn || !firebaseReady;

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
            <Button type="submit" className="w-full" disabled={isButtonDisabled}>
              {isLoggingIn ? 'Entrando...' : (firebaseReady ? 'Entrar' : 'Carregando...')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
