
export enum SellingRecommendation {
  SELL_NOW = 'SELL_NOW',
  WAIT = 'WAIT'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PredictionData {
  crop: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'bags';
  currentPrice: number;
  predictedPrice: number;
  recommendation: SellingRecommendation;
  risk: RiskLevel;
  explanation: string;
  explanationTelugu: string;
  daysToWait: number;
  profitDelta: number;
  trendData: Array<{ day: string; price: number }>;
  qualityAssessment?: string;
  qualityGrade?: 'A' | 'B' | 'C';
  sources?: GroundingSource[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  type: 'text' | 'prediction';
  prediction?: PredictionData;
  timestamp: Date;
  imageUrl?: string;
}

export interface FarmerProfile {
  location: string;
  language: 'English' | 'Telugu';
}
