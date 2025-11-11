'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SuggestedRepliesProps = {
  suggestions: string[];
  onSelectReply: (reply: string) => void;
  className?: string;
};

export default function SuggestedReplies({
  suggestions,
  onSelectReply,
  className,
}: SuggestedRepliesProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex gap-2 justify-center flex-wrap mb-3 animate-in fade-in",
        className
      )}
    >
      {suggestions.map((reply) => {
        const isFreeTextHint = reply === '(Livre digitação)';
        
        return (
          <Button
            key={reply}
            variant={isFreeTextHint ? "ghost" : "outline"}
            size="sm"
            className={cn(
              "rounded-full transition-transform duration-150 active:scale-95",
              isFreeTextHint 
                ? "text-sm font-bold text-white bg-transparent px-3 py-1 cursor-default w-full pointer-events-none"
                : "bg-background/50 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/10"
            )}
            onClick={() => onSelectReply(reply)}
            disabled={isFreeTextHint}
          >
            {reply}
          </Button>
        );
      })}
    </div>
  );
}
