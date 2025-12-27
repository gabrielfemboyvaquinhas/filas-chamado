
import { Token, TokenStatus } from '../types';

/**
 * In a real scenario, this would call the Gemini API.
 * Here we simulate an intelligent response based on current queue metrics.
 */
export const generateAIInsights = async (tokens: Token[]) => {
  const waitingTokens = tokens.filter(t => t.status === TokenStatus.WAITING);
  const servingTokens = tokens.filter(t => t.status === TokenStatus.SERVING);
  
  const waitingCount = waitingTokens.length;
  const servingCount = servingTokens.length;

  // Simple logic to simulate "intelligence"
  let waitTime = Math.max(2, waitingCount * 5); // Base 5 mins per person
  let recommendation = "";

  if (waitingCount === 0) {
    recommendation = "Fluxo de atendimento excelente. Todos os balcões estão prontos para novos clientes.";
    waitTime = 1;
  } else if (waitingCount < 5) {
    recommendation = "O tempo de espera está dentro do esperado. Continue com o atendimento padrão.";
  } else if (waitingCount < 10) {
    recommendation = "Aumento súbito de clientes detectado. Considere priorizar os tokens de categoria 'Prioritário' para evitar gargalos.";
  } else {
    recommendation = "ALERTA: Fila muito longa! Recomenda-se abrir um balcão extra ou realocar staff de suporte para triagem rápida.";
    waitTime += 15; // Extra congestion penalty
  }

  // Artificial delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    recommendation,
    waitTime
  };
};
