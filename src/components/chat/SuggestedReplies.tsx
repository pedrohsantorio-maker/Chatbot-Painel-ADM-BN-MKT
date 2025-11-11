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
      {suggestions.map((reply) => (
        <Button
          key={reply}
          variant="outline"
          size="sm"
          className="rounded-full bg-background/50 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => onSelectReply(reply)}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}
