'use client';

import { useState, useEffect } from 'react';
import type { Message } from '../types';
import { useToast } from '@/components/ui/use-toast';

type ConversationStage = 
  | 'start'
  | 'awaiting_name'
  | 'awaiting_email'
  | 'awaiting_link_permission'
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
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState<ConversationStage>('start');
  const [userData, setUserData] = useState({ name: '', email: '' });
  const { toast } = useToast();

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      { ...message, id: crypto.randomUUID(), timestamp: Date.now() },
    ]);
  };
  
  const botReply = (text: string, delay: number = 1000, newStage?: ConversationStage) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage({ sender: 'bot', text, type: 'text' });
      setIsTyping(false);
      if (newStage) {
        setStage(newStage);
      }
    }, delay);
  };

  useEffect(() => {
    // Initial welcome message
    botReply("Oi, eu sou Gi. Posso te fazer 2 perguntinhas rápidas?", 500, 'awaiting_name');
  }, []);

  const handleUserMessage = (text: string) => {
    addMessage({ sender: 'user', text, type: 'text' });
    
    switch (stage) {
      case 'awaiting_name':
        setUserData(prev => ({ ...prev, name: text }));
        botReply(`Prazer, ${text}! Agora, qual o seu melhor e-mail?`, 1200, 'awaiting_email');
        break;

      case 'awaiting_email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(text)) {
          setUserData(prev => ({ ...prev, email: text }));
          
          setIsTyping(true);
          setTimeout(() => {
            addMessage({
                sender: 'bot',
                type: 'audio',
                mediaUrl: '/empathy-audio.mp3', // Placeholder for function-based URL
                mediaMeta: { duration: '00:05' },
            });
            setIsTyping(false);

            setTimeout(() => {
                botReply("Obrigada! Suas informações estão seguras comigo. Posso te enviar o link para a próxima etapa?", 2000, 'awaiting_link_permission');
            }, 500);

          }, 1500);

        } else {
          botReply("Parece que esse e-mail não é válido. Você poderia tentar de novo?", 1000);
        }
        break;

      case 'awaiting_link_permission':
        const positiveResponse = ['sim', 's', 'pode', 'claro', 'ok', 'yes'].some(w => text.toLowerCase().includes(w));
        if (positiveResponse) {
          botReply("Perfeito! Gerando seu link exclusivo...", 1000);
          setTimeout(() => {
             addMessage({ sender: 'bot', type: 'link', text: 'https://firebase.google.com/' });
             setIsTyping(false);
             setStage('end');
          }, 2500);
        } else {
          botReply("Tudo bem. Se mudar de ideia, é só me avisar!", 1000, 'end');
        }
        break;
      
      default:
        botReply("Não entendi, mas se precisar de algo, estou aqui!", 1000);
        break;
    }
  };

  const sendMediaMessage = (file: File, type: 'audio' | 'image' | 'video') => {
    const mediaUrl = URL.createObjectURL(file);
    const commonMessagePart = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sender: 'user' as const,
        mediaUrl,
        mediaMeta: {
            fileName: file.name,
            fileSize: formatFileSize(file.size),
        },
    };

    if (type === 'audio') {
        formatAudioDuration(file, (duration) => {
            setMessages((prev) => [
                ...prev,
                { ...commonMessagePart, type, mediaMeta: { ...commonMessagePart.mediaMeta, duration } },
            ]);
        });
    } else {
         setMessages((prev) => [
            ...prev,
            { ...commonMessagePart, type },
        ]);
    }
    
    // Simulate bot offline error
    if (!navigator.onLine) {
        toast({
            variant: "destructive",
            title: "Serviço temporariamente indisponível",
            description: "Você parece estar offline. A mensagem será enviada assim que a conexão for restaurada.",
        });
    }

    botReply("Recebi sua mídia!", 1500);
  };


  return { messages, isTyping, sendMessage: handleUserMessage, sendMediaMessage };
}
