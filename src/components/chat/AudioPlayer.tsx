import { Play } from 'lucide-react';

type AudioPlayerProps = {
  src: string;
  duration?: string;
};

export default function AudioPlayer({ src, duration }: AudioPlayerProps) {
  return (
    <div className="flex items-center gap-3 w-64">
      <div className="text-primary-foreground/80">
        <Play className="h-6 w-6" fill="currentColor" />
      </div>
      <div className="flex-grow">
        {/* A simple representation. A real one would have a progress bar. */}
        <audio controls className="w-full h-8 hidden">
            <source src={src} type="audio/webm" />
            Your browser does not support the audio element.
        </audio>
        <div className="w-full bg-primary-foreground/30 h-1 rounded-full"></div>
      </div>
      {duration && <span className="text-xs text-primary-foreground/70">{duration}</span>}
    </div>
  );
}
