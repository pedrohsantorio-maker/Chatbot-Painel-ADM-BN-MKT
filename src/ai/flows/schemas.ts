import { z } from 'zod';

// Esquema de entrada para a análise da conversa
export const AnalyzeConversationInputSchema = z.object({
  userId: z.string().describe("O ID único do usuário (lead)."),
  userEmail: z.string().optional().describe("O e-mail do usuário, se disponível."),
  messages: z.array(z.object({
    sender: z.enum(['user', 'bot']).describe("Quem enviou a mensagem."),
    text: z.string().describe("O conteúdo da mensagem."),
    timestamp: z.string().describe("O timestamp da mensagem no formato ISO."),
  })).describe("O histórico de mensagens da conversa.")
});
export type AnalyzeConversationInput = z.infer<typeof AnalyzeConversationInputSchema>;

// Esquema de saída da análise da IA
export const AnalyzeConversationOutputSchema = z.object({
  summary: z.string().describe("Um resumo conciso da interação, destacando os pontos principais."),
  userSentiment: z.enum(['Positivo', 'Negativo', 'Neutro', 'Ansioso', 'Animado']).describe("O sentimento geral do usuário durante a conversa."),
  dropOffReason: z.string().describe("A razão mais provável pela qual o usuário abandonou a conversa ou perdeu o interesse. Se o usuário concluiu o fluxo, indique isso."),
  optimizationSuggestions: z.array(z.string()).describe("Pelo menos 2 sugestões acionáveis para otimizar o funil ou as respostas do bot com base nesta conversa específica."),
});
export type AnalyzeConversationOutput = z.infer<typeof AnalyzeConversationOutputSchema>;
