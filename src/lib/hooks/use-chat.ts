'use client';

import { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState<ConversationStage>('start');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const initialMessageSent = useRef(false);
  
  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage = { ...message, id: crypto.randomUUID(), timestamp: Date.now() };
    setMessages((prev) => {
      // Remove suggestions from previous bot message
      const updatedPrev = prev.map(m => ({ ...m, suggestions: [] }));
      return [...updatedPrev, newMessage];
    });
    if (message.sender === 'user') {
      setIsSending(true);
      setTimeout(() => setIsSending(false), 1000); // Debounce
    }
    return newMessage;
  };
  
  const botReply = (text: string, delay: number = 1000, options: { newStage?: ConversationStage, suggestions?: string[] } = {}) => {
    setIsTyping(true);
    setSuggestions([]);
    return new Promise<Message>(resolve => {
        setTimeout(() => {
          const msg = addMessage({ sender: 'bot', text, type: 'text', suggestions: options.suggestions });
          setIsTyping(false);
          if (options.newStage) {
            setStage(options.newStage);
          }
          if (options.suggestions) {
            setSuggestions(options.suggestions);
          }
          resolve(msg);
        }, delay);
    });
  };

  const botMediaReply = (type: 'image' | 'audio' | 'link', mediaUrl: string, text?: string, delay: number = 1000, options: { newStage?: ConversationStage, suggestions?: string[] } = {}) => {
    setIsTyping(true);
    setSuggestions([]);
    return new Promise<Message>(resolve => {
        setTimeout(() => {
          let mediaMeta: Message['mediaMeta'] = {};
          if (type === 'audio') {
              mediaMeta = { duration: '0:05' } // Placeholder duration
          }
          const msg = addMessage({ sender: 'bot', type, mediaUrl: type === 'link' ? undefined : mediaUrl, text: type === 'link' ? mediaUrl : text, mediaMeta, suggestions: options.suggestions });
          setIsTyping(false);
          if (options.newStage) {
            setStage(options.newStage);
          }
           if (options.suggestions) {
            setSuggestions(options.suggestions);
          }
          resolve(msg);
        }, delay);
    });
  }


  useEffect(() => {
    if (stage === 'start' && !initialMessageSent.current) {
        initialMessageSent.current = true;
        botReply("Oi, gostoso, como você tá?❤", 500, {
            newStage: 'awaiting_first_response',
            suggestions: ['Tudo sim amor, e você, gostosa?', 'Tô bem']
        });
    }
  }, [stage]);

  const handleUserMessage = async (text: string) => {
    if (text === '(Livre digitação)') return; // Don't send the hint as a message
    addMessage({ sender: 'user', text, type: 'text' });
    setSuggestions([]); // Clear suggestions after user sends a message
    
    switch (stage) {
      case 'awaiting_first_response':
        setIsTyping(true);
        await botReply("Vi que você me chamou, safado... quer ver o que tenho de mais quente só pra você? 😈 Tenho fotos e vídeos, tudo bem gostoso, que vai te deixar louco de tesão…", 1500);
        await botReply("E você, meu amor, tem sorte... me chamou bem na hora que tô toda molhadinha de tesão aqui 🥵 Posso te dar um presentinho? 😏", 2000, { newStage: 'awaiting_gift_response', suggestions: ['(Livre digitação)'] });
        break;

      case 'awaiting_gift_response':
        const negativeResponse = ['não', 'nao', 'agora não', 'depois'].some(w => text.toLowerCase().includes(w));
        if (negativeResponse) {
           await botReply("Tem certeza que não quer bb😈?", 1000, { suggestions: ['(Livre digitação)']});
           // Remain in the same stage
        } else {
            const firstImage = PlaceHolderImages.find(img => img.id === 'preview1');
            await botMediaReply('image', firstImage?.imageUrl || '', "só uma prévia do que você pode ter mais, bebê 😈", 1500);
            await botReply("Acabei de tirar pra você, gostoso, me diz, gostou? 🙈", 1200, { 
                newStage: 'awaiting_like_response',
                suggestions: ['Sim, gostei😈', 'Gostei e muito🔥']
            });
        }
        break;

      case 'awaiting_like_response':
        const positiveLike = ['sim', 'gostei', 'claro', 'muito'].some(w => text.toLowerCase().includes(w));
        if (positiveLike) {
            await botReply("Você gosta né safado, quer ver mais pouquinho? Tô cheia de tesão 😈", 1500);
            const secondImage = PlaceHolderImages.find(img => img.id === 'preview2');
            await botMediaReply('image', secondImage?.imageUrl || '', "mais uma só pra te deixar ainda mais louco, quer mais?", 2000);
            await botReply("Gostou assim meu amor? Tá querendo mais ou vai ficar me pedindo até eu ceder de vez? 👀", 1500, { 
                newStage: 'awaiting_more_response',
                suggestions: ['Quero mais safada 😈', 'Quero te ver todinha👀']
            });
        } else {
           await botReply("Hmm, achei que ia gostar. Quer tentar outra coisa?", 1000, { suggestions: ['(Livre digitação)'] });
        }
        break;
      
      case 'awaiting_more_response':
        const wantsMore = ['quero', 'mais', 'mostra', 'todinha'].some(w => text.toLowerCase().includes(w));
        if (wantsMore) {
            await botReply("Seu safado, conversar com você tá me deixando toda molhadinha 🥵", 1500);
            await botReply("Entre nós, bebê… tô adorando conversar com você, já tô doida pra você me ver bem peladinha, gozando bem gostosa só pra você 😈", 2000);
            await botMediaReply('audio', '/empathy-audio.mp3', undefined, 1500);
            await botReply("E aí, amor, o que você me diz? Tá preparado pra me ter inteirinha pra você? 🔥❤", 1200, {
                newStage: 'awaiting_final_confirmation',
                suggestions: ['Sim, topo tudo, quero você inteirinha! 😈', 'Claro, tô pronto pra te ter do jeito que você quiser!']
            });
        } else {
            await botReply("Se não quer mais, tudo bem. Fico te esperando aqui...", 1000, { newStage: 'end' });
        }
        break;

      case 'awaiting_final_confirmation':
        const finalConfirmation = ['sim', 'topo', 'quero', 'claro', 'pronto'].some(w => text.toLowerCase().includes(w));
        if (finalConfirmation) {
            setIsTyping(true);
            await botMediaReply('link', 'https://firebase.google.com/', undefined, 2000); // Placeholder Link
            await botReply("Estou te esperando, vem me ver peladinha e fazer o que quiser comigo… 🤭", 1500, { newStage: 'end' });
        } else {
            botReply("Que pena, bebê... Achei que você queria. Se mudar de ideia, sabe onde me encontrar. 😉", 1000, { newStage: 'end' });
        }
        break;

      case 'end':
        botReply("Não não meu amor, agora você terá que ir para o link se quiser me ver peladinha🤭 vamos lá logo gostoso", 1000);
        break;

      default: // any unhandled case
        botReply("Se precisar de mais alguma coisa, é só chamar, gostoso. 😉", 1000);
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
    
    if (!navigator.onLine) {
        toast({
            variant: "destructive",
            title: "Serviço temporariamente indisponível",
            description: "Você parecer estar offline. A mensagem será enviada assim que a conexão for restaurada.",
        });
    }

    botReply("Uau, que delícia! 🔥 Adorei o que você mandou...", 1500);
  };


  return { messages, isTyping, suggestions, sendMessage: handleUserMessage, sendMediaMessage, isSending };
}
