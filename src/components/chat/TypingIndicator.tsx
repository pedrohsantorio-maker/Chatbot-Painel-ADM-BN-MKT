export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 p-2">
      <div className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-pulse"></div>
    </div>
  );
}
