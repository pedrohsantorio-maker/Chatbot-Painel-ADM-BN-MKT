'use server';
/**
 * @fileOverview Fluxo de IA para analisar uma conversa de chatbot.
 * 
 * - analyzeConversation: Função que executa a análise da conversa.
 * - AnalyzeConversationInput: Tipo de entrada para a função de análise.
 * - AnalyzeConversationOutput: Tipo de saída para a função de análise.
 */

import { ai } from '@/ai/genkit';
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

// Função exportada que será chamada pelo frontend
export async function analyzeConversation(input: AnalyzeConversationInput): Promise<AnalyzeConversationOutput> {
  return analyzeConversationFlow(input);
}

// Definição do prompt para a IA
const analysisPrompt = ai.definePrompt({
    name: 'analyzeConversationPrompt',
    input: { schema: AnalyzeConversationInputSchema },
    output: { schema: AnalyzeConversationOutputSchema },
    prompt: `
      Você é um especialista em análise de conversas e otimização de funis de venda para chatbots.
      Sua tarefa é analisar a seguinte conversa de um lead com um chatbot de nome "Ster" e fornecer insights valiosos.

      Contexto do Chatbot:
      - O chatbot "Ster" tem uma persona sensual e provocante.
      - O objetivo final é levar o lead a clicar em um link para conteúdo exclusivo no Telegram.
      - O fluxo passa por etapas de provocação, envio de prévias (fotos) e um áudio para gerar desejo.

      Dados do Lead:
      - ID do Usuário: {{{userId}}}
      {{#if userEmail}}- Email: {{{userEmail}}}{{/if}}

      Histórico da Conversa:
      {{#each messages}}
      - [{{timestamp}}] {{{sender}}}: {{{text}}}
      {{/each}}

      Sua Análise DEVE focar nos seguintes pontos:

      1.  **Resumo da Conversa (summary):** Faça um resumo curto e objetivo do que aconteceu na conversa.
      2.  **Sentimento do Usuário (userSentiment):** Avalie o sentimento predominante do usuário. Ele estava engajado, cético, confuso, animado? Escolha uma das opções: 'Positivo', 'Negativo', 'Neutro', 'Ansioso', 'Animado'.
      3.  **Razão do Abandono/Desinteresse (dropOffReason):** Identifique o ponto exato e a razão mais provável pela qual o usuário parou de responder ou abandonou o fluxo. Se ele clicou no link final, afirme que o funil foi concluído com sucesso. Seja específico (ex: "O usuário parou de responder após o bot pedir confirmação para enviar o link final, possivelmente por hesitação ou por achar o áudio pouco convincente.").
      4.  **Sugestões de Otimização (optimizationSuggestions):** Com base nesta conversa específica, forneça pelo menos duas sugestões práticas e acionáveis para melhorar o fluxo do chatbot. Pense em alterar textos, o timing das mensagens, o tipo de mídia ou as opções de resposta. (ex: "O tempo de espera após o envio do áudio foi muito longo, considere encurtar para manter o 'momentum'." ou "A pergunta 'gostou?' pode ser muito fechada, tente algo como 'O que mais você gostaria de ver? 😈' para incentivar mais interação.").

      Seja direto, objetivo e forneça insights que realmente ajudem a melhorar a taxa de conversão do chatbot.
    `,
});

// Definição do fluxo do Genkit
const analyzeConversationFlow = ai.defineFlow(
  {
    name: 'analyzeConversationFlow',
    inputSchema: AnalyzeConversationInputSchema,
    outputSchema: AnalyzeConversationOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    if (!output) {
        throw new Error("A análise da IA não retornou uma resposta válida.");
    }
    return output;
  }
);
