'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useAuth, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, setDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

type ConversationStage = 
  | 'start'
  | 'awaiting_first_response'
  | 'awaiting_gift_response'
  | 'awaiting_like_response'
  | 'awaiting_more_response'
  | 'awaiting_final_confirmation'
  | 'end';

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const formatAudioDuration = (file: File, callback: (duration: string) => void) => {
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        callback(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
};

const calculateDelay = (text: string): number => {
    const words = text.split(' ').length;
    if (words <= 5) {
        return Math.random() * 1000 + 1000; // 1-2 seconds
    }
    if (words <= 15) {
        return Math.random() * 2000 + 2000; // 2-4 seconds
    }
    return Math.random() * 3000 + 4000; // 4-7 seconds
};


export function useChat() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  
  const messagesCollectionRef = useMemoFirebase(() => 
    user && firestore ? query(collection(firestore, `users/${user.uid}/chat_messages`), orderBy('timestamp', 'asc')) : null,
  [user, firestore]);
  
  const { data: persistentMessages, isLoading: messagesLoading } = useCollection<Omit<Message, 'id'>>(messagesCollectionRef);

  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState<ConversationStage>('start');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const flowStarted = useRef(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (!user && !isUserLoading && auth) {
        initiateAnonymousSignIn(auth);
      }
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        // Set document with merge to avoid overwriting on subsequent logins.
        await setDoc(userDocRef, { 
            id: user.uid,
            email: user.email || null,
            createdAt: serverTimestamp(),
         }, { merge: true });
      }
    };
    initializeUser();
  }, [user, isUserLoading, auth, firestore]);

  const addMessageToFirestore = useCallback(async (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!user || !firestore) return;
    const collectionRef = collection(firestore, `users/${user.uid}/chat_messages`);
    
    const messageToSend: any = {
      ...message,
      timestamp: serverTimestamp(),
    };

    if (message.type !== 'text' && message.type !== 'link') {
      delete messageToSend.text;
    }
    
    if (message.type === 'link') {
      if ('mediaUrl' in messageToSend) {
        delete messageToSend.mediaUrl;
      }
    }

    if (message.sender === 'user') {
      delete messageToSend.suggestions;
    }


    try {
      await addDoc(collectionRef, messageToSend);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Erro de Conexão",
        description: "Não foi possível enviar a mensagem. Verifique sua conexão.",
      });
    }
  }, [user, firestore, toast]);

  
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (message.sender === 'user') {
      setIsSending(true);
      addMessageToFirestore(message).finally(() => {
          setIsSending(false)
      });
    } else {
       addMessageToFirestore(message);
    }
  }, [addMessageToFirestore]);
  
  const botReply = useCallback((text: string, options: { newStage?: ConversationStage, suggestions?: string[] } = {}) => {
    const delay = calculateDelay(text);
    setIsTyping(true);
    setSuggestions([]);
    return new Promise<void>(resolve => {
        setTimeout(() => {
          addMessage({ sender: 'bot', text, type: 'text', suggestions: options.suggestions || [] });
          setIsTyping(false);
          if (options.newStage) {
            setStage(options.newStage);
          }
          if (options.suggestions) {
            setSuggestions(options.suggestions);
          }
          resolve();
        }, delay);
    });
  }, [addMessage]);

  const botMediaReply = useCallback((type: 'image' | 'audio' | 'link', mediaUrl: string, text?: string, delay: number = 1000, options: { newStage?: ConversationStage, suggestions?: string[] } = {}) => {
    setIsTyping(true);
    setSuggestions([]);
    return new Promise<void>(resolve => {
        setTimeout(() => {
          let mediaMeta: Message['mediaMeta'] = {};
          if (type === 'audio') {
              mediaMeta = { duration: '0:15' } // Placeholder duration
          }
          const messagePayload: Omit<Message, 'id' | 'timestamp'> = {
              sender: 'bot',
              type,
              mediaUrl: type !== 'link' ? mediaUrl : undefined,
              text: type === 'link' ? mediaUrl : text,
              mediaMeta,
              suggestions: options.suggestions || []
          };

          if (type === 'link' && 'mediaUrl' in messagePayload) {
            delete messagePayload.mediaUrl;
          }
          
          addMessage(messagePayload);
          setIsTyping(false);
          if (options.newStage) {
            setStage(options.newStage);
          }
           if (options.suggestions) {
            setSuggestions(options.suggestions);
          }
          resolve();
        }, delay);
    });
  }, [addMessage]);

  const startConversation = useCallback(() => {
    flowStarted.current = true;
    botReply("Oi, gostoso, como você tá?❤", {
        newStage: 'awaiting_first_response',
        suggestions: ['Tudo sim amor, e você, gostosa?', 'Tô bem']
    });
  }, [botReply]);

  useEffect(() => {
    if (messagesLoading || flowStarted.current || !persistentMessages) return;
    
    if (persistentMessages.length === 0) {
       startConversation();
    } else {
        const lastBotMessage = [...persistentMessages].reverse().find(m => m.sender === 'bot');

        if(lastBotMessage?.suggestions && lastBotMessage.suggestions.length > 0) {
            setSuggestions(lastBotMessage.suggestions);
        }
        
        let currentStage: ConversationStage = 'start';
        if (lastBotMessage?.text?.includes("como você tá?")) currentStage = 'awaiting_first_response';
        else if (lastBotMessage?.text?.includes("presentinho?")) currentStage = 'awaiting_gift_response';
        else if (lastBotMessage?.text?.includes("gostou?")) currentStage = 'awaiting_like_response';
        else if (lastBotMessage?.text?.includes("quer mais?")) currentStage = 'awaiting_more_response';
        else if (lastBotMessage?.text?.includes("inteirinha pra você?")) currentStage = 'awaiting_final_confirmation';
        else if (lastBotMessage?.text?.includes("Estou te esperando")) currentStage = 'end';
        setStage(currentStage);
        flowStarted.current = true;
    }
  }, [persistentMessages, messagesLoading, startConversation]);

  const handleRestartChat = useCallback(async () => {
    if (!user || !firestore) return;
    
    toast({
      title: "Reiniciando a conversa...",
      description: "Aguarde um momento.",
    });

    const messagesRef = collection(firestore, `users/${user.uid}/chat_messages`);
    const querySnapshot = await getDocs(messagesRef);
    const batch = writeBatch(firestore);
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    setStage('start');
    setSuggestions([]);
    flowStarted.current = false;
    
    startConversation();

  }, [user, firestore, toast, startConversation]);


  const handleUserMessage = async (text: string) => {
    if (text === '(Livre digitação)') return;
    
    if (text.toLowerCase().trim() === 'reiniciar') {
      await handleRestartChat();
      return;
    }

    addMessage({ sender: 'user', text, type: 'text' });
    setSuggestions([]);

    switch (stage) {
      case 'awaiting_first_response':
        await botReply("Vi que você me chamou, safado... quer ver o que tenho de mais quente só pra você? 😈 Tenho fotos e vídeos, tudo bem gostoso, que vai te deixar louco de tesão…");
        await botReply("E você, meu amor, tem sorte... me chamou bem na hora que tô toda molhadinha de tesão aqui 🥵 Posso te dar um presentinho? 😏", { newStage: 'awaiting_gift_response', suggestions: ['(Livre digitação)'] });
        break;

      case 'awaiting_gift_response':
        const negativeResponse = ['não', 'nao', 'agora não', 'depois'].some(w => text.toLowerCase().includes(w));
        if (negativeResponse) {
           await botReply("Tem certeza que não quer bb😈?", { suggestions: ['(Livre digitação)']});
        } else {
            const firstImage = PlaceHolderImages.find(img => img.id === 'preview1');
            await botMediaReply('image', firstImage?.imageUrl || '', "só uma prévia do que você pode ter mais, bebê 😈", 1500);
            await botReply("Acabei de tirar pra você, gostoso, me diz, gostou? 🙈", { 
                newStage: 'awaiting_like_response',
                suggestions: ['Sim, gostei😈', 'Gostei e muito🔥']
            });
        }
        break;

      case 'awaiting_like_response':
        const positiveLike = ['sim', 'gostei', 'claro', 'muito'].some(w => text.toLowerCase().includes(w));
        if (positiveLike) {
            await botReply("Você gosta né safado, quer ver mais pouquinho? Tô cheia de tesão 😈");
            const secondImage = PlaceHolderImages.find(img => img.id === 'preview2');
            await botMediaReply('image', secondImage?.imageUrl || '', "mais uma só pra te deixar ainda mais louco, quer mais?", 2000);
            await botReply("Gostou assim meu amor? Tá querendo mais ou vai ficar me pedindo até eu ceder de vez? 👀", { 
                newStage: 'awaiting_more_response',
                suggestions: ['Quero mais safada 😈', 'Quero te ver todinha👀']
            });
        } else {
           await botReply("Hmm, achei que ia gostar. Quer tentar outra coisa?", { suggestions: ['(Livre digitação)'] });
        }
        break;
      
      case 'awaiting_more_response':
        const wantsMore = ['quero', 'mais', 'mostra', 'todinha'].some(w => text.toLowerCase().includes(w));
        if (wantsMore) {
            await botReply("Seu safado, conversar com você tá me deixando toda molhadinha 🥵");
            await botReply("Entre nós, bebê… tô adorando conversar com você, já tô doida pra você me ver bem peladinha, gozando bem gostosa só pra você 😈");
            await botMediaReply('audio', 'https://thriving-mermaid-fe7406.netlify.app/AUDIO-2025-11-11-16-42-18.mp3', undefined, 10000);
            await botReply("E aí, amor, o que você me diz? Tá preparado pra me ter inteirinha pra você? 🔥❤", {
                newStage: 'awaiting_final_confirmation',
                suggestions: ['Sim, topo tudo, quero você inteirinha! 😈', 'Claro, tô pronto pra te ter do jeito que você quiser!']
            });
        } else {
            await botReply("Se não quer mais, tudo bem. Fico te esperando aqui...", { newStage: 'end' });
        }
        break;

      case 'awaiting_final_confirmation':
        const finalConfirmation = ['sim', 'topo', 'quero', 'claro', 'pronto'].some(w => text.toLowerCase().includes(w));
        if (finalConfirmation) {
            await botMediaReply('link', 'https://t.me/Ster_SpicyyBOT', undefined, 2000);
            await botReply("Estou te esperando, vem me ver peladinha e fazer o que quiser comigo… 🤭", { newStage: 'end' });
        } else {
            botReply("Que pena, bebê... Achei que você queria. Se mudar de ideia, sabe onde me encontrar. 😉", { newStage