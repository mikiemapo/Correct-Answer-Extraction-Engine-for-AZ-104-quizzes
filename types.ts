
export interface ExtractedQuestion {
  question_summary: string;
  correct_answer: string;
  explanation: string;
  domain: string;
}

export interface ExtractionRequest {
  quizText: string;
  domain: string;
}

export enum ExtractionStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
