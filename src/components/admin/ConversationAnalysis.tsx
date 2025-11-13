'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Lightbulb, BarChart, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { analyzeConversation } from '@/ai/flows/analyze-conversation-flow';
import type { AnalyzeConversationOutput, AnalyzeConversationInput } from '@/ai/flows/schemas';
import { Message, UserDetails } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';


type ConversationAnalysisProps = {
    userId: string;
    user: UserDetails | null;
    messages: Message[];
};

export default function ConversationAnalysis({ userId, user, messages }: ConversationAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalyzeConversationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const formattedMessages = messages.map(m => ({
        sender: m.sender,
        text: m.text || `[${m.type} enviado]`,
        timestamp: m.timestamp instanceof Timestamp ? m.timestamp.toDate().toISOString() : new Date(m.timestamp).toISOString()
    }));

    const input: AnalyzeConversationInput = {
        userId: userId,
        userEmail: user?.email || undefined,
        messages: formattedMessages
    }

    try {
      const result = await analyzeConversation(input);
      setAnalysis(result);
    } catch (e: any) {
      console.error("Error analyzing conversation:", e);
      setError(e.message || "Ocorreu um erro ao analisar a conversa.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500">
            <Alert className={
                analysis.userSentiment === 'Positivo' ? 'border-green-500/50' :
                analysis.userSentiment === 'Negativo' ? 'border-red-500/50' :
                'border-yellow-500/50'
            }>
                <AlertTitle className="font-bold flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Sentimento do Usuário
                </AlertTitle>
                <AlertDescription>
                    <Badge variant={
                        analysis.userSentiment === 'Positivo' ? 'default' :
                        analysis.userSentiment === 'Negativo' ? 'destructive' :
                        'secondary'
                    } className={analysis.userSentiment === 'Positivo' ? 'bg-green-600/80' : ''}>
                        {analysis.userSentiment}
                    </Badge>
                </AlertDescription>
            </Alert>
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                       <AlertTriangle className="h-5 w-5 text-destructive" /> Ponto de Abandono/Desinteresse
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{analysis.dropOffReason}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-400" />
                        Sugestões de Otimização
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                        {analysis.optimizationSuggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Resumo da Conversa</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                </CardContent>
            </Card>

        </div>
    );
  }

  const renderLoading = () => (
      <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
      </div>
  )

  const renderError = () => (
      <Alert variant="destructive">
          <AlertTitle>Erro na Análise</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
      </Alert>
  )

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Análise com IA</CardTitle>
        <Button onClick={handleAnalyze} disabled={isLoading || messages.length === 0}>
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Analisando...' : 'Analisar Conversa'}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {!isLoading && !analysis && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                 <Wand2 className="h-12 w-12 mb-4 text-primary/50"/>
                 <h3 className="text-lg font-semibold">Análise de Conversa</h3>
                 <p className="text-sm">Clique no botão para usar IA e obter insights sobre o sentimento do lead, pontos de abandono e sugestões para otimizar seu funil.</p>
            </div>
        )}
        {isLoading && renderLoading()}
        {error && renderError()}
        {analysis && renderAnalysis()}
      </CardContent>
    </Card>
  );
}
