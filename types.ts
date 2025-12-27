
export enum ServiceCategory {
  GENERAL = 'Normal',
  PRIORITY = 'Prioritário',
  BUSINESS = 'Empresarial'
}

export enum TokenStatus {
  WAITING = 'Aguardando',
  SERVING = 'Em Atendimento',
  COMPLETED = 'Concluído',
  CANCELLED = 'Cancelado'
}

export interface Token {
  id: string;
  number: number;
  prefix: string;
  category: ServiceCategory;
  status: TokenStatus;
  issuedAt: Date;
  startedServingAt?: Date;
  completedAt?: Date;
}

export interface ServingStatus {
  counterId: number;
  currentToken: Token | null;
  allowedCategories: ServiceCategory[];
}

export interface AIAnalysis {
  estimatedWaitTime: number;
  recommendation: string;
  loadLevel: 'Low' | 'Medium' | 'High';
}
