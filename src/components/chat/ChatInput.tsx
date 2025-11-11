'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Mic, Paperclip, Send, Square, Trash2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../ui/use-toast';

type ChatInputProps = {
  onSendMessage: (text: string) => void;
  onSendMedia: (file: File, type: 'audio' | 'image' | 'video') => void;
};

export default function ChatInput({ onSendMessage, onSendMedia }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isSending) {
      onSendMessage(text.trim());
      setText('');
      setIsSending(true);
      setTimeout(() => setIsSending(false), 1000); // Debounce
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Erro de gravação",
        description: "Não foi possível acessar o microfone. Verifique as permissões do seu navegador.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const sendAudio = () => {
    if (audioBlob) {
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      onSendMedia(audioFile, 'audio');
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };
  
  const discardRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onSendMedia(file, 'image');
      } else if (file.type.startsWith('video/')) {
        onSendMedia(file, 'video');
      } else {
        toast({
          variant: 'destructive',
          title: 'Formato de arquivo não suportado',
          description: 'Por favor, selecione uma imagem ou vídeo.',
        });
      }
    }
  };

  return (
    <div className="p-3 border-t bg-card">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {isRecording || audioBlob ? (
          <div className="flex w-full items-center gap-2">
            {audioBlob ? (
                <>
                    <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={discardRecording}><Trash2 /></Button>
                    <div className="flex-grow text-center text-sm font-mono">{formatTime(recordingTime)}</div>
                    <Button type="button" size="icon" onClick={sendAudio} className="bg-primary hover:bg-primary/90 rounded-full"><Send /></Button>
                </>
            ) : (
                <>
                    <Button type="button" size="icon" variant="destructive" onClick={stopRecording}><Square/></Button>
                    <div className="flex-grow text-center text-sm text-destructive font-mono animate-pulse">Gravando áudio... {formatTime(recordingTime)}</div>
                </>
            )}
          </div>
        ) : (
          <>
            <Input
              type="text"
              placeholder="Digite uma mensagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-grow bg-white dark:bg-slate-800"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            {text.trim() ? (
              <Button type="submit" size="icon" disabled={isSending} className="bg-primary hover:bg-primary/90 rounded-full">
                <Send className="h-5 w-5" />
              </Button>
            ) : (
              <Button type="button" size="icon" onClick={startRecording} className="bg-primary hover:bg-primary/90 rounded-full">
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </form>
    </div>
  );
}
