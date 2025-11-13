'use client';

import { Play, Pause } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

type AudioPlayerProps = {
  src: string;
};

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('00:00');
  const [currentTime, setCurrentTime] = useState('00:00');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(formatTime(audio.duration));
      }
    };
    
    const setAudioTime = () => {
      setCurrentTime(formatTime(audio.currentTime));
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-3 w-64 text-primary-foreground">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden"></audio>
      <button onClick={togglePlay} className="flex-shrink-0 text-primary-foreground/80 hover:text-primary-foreground focus:outline-none">
        {isPlaying ? (
          <Pause className="h-6 w-6" fill="currentColor" />
        ) : (
          <Play className="h-6 w-6" fill="currentColor" />
        )}
      </button>
      <div className="flex-grow flex items-center gap-2">
        <div className="w-full bg-primary-foreground/30 h-1 rounded-full relative">
            <div className="bg-primary-foreground h-1 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="text-xs text-primary-foreground/70 w-10">{ isPlaying ? currentTime : duration}</span>
      </div>
    </div>
  );
}
