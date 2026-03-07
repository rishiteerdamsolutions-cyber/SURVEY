export interface QuestionOption {
  value: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  required: boolean;
  type: 'radio';
  options: QuestionOption[];
  showIf?: { [k: string]: string };
}

export interface IdeaQuestions {
  part1: SurveyQuestion[];
  part2: SurveyQuestion[];
  part3?: SurveyQuestion[];
  interest: SurveyQuestion;
}

export interface Idea {
  _id?: string;
  ideaSlug: string;
  ideaName: string;
  logo: string;
  headline: string;
  description: string;
  questions: IdeaQuestions;
  createdAt: Date;
}

export interface Company {
  _id?: string;
  ideaSlug: string;
  companyName: string;
  companySlug: string;
  createdAt: Date;
  surveyLink: string;
  notes?: string;
}

export interface AnswersPart1 {
  hasLentMoney: 'yes' | 'no';
  facedRepaymentDelays?: 'yes' | 'no';
  lostMoney?: 'yes' | 'no';
  averageLoanSize?: 'under-5k' | '5k-25k' | '25k-50k' | '50k-1lakh' | 'above-1lakh';
  hesitatedToAsk?: 'yes' | 'no';
  wantStructuredPlatform?: 'yes' | 'no';
}

export interface AnswersPart2 {
  experiencedDelayedPayments: 'yes' | 'no';
  delayedPaymentType?: 'salary' | 'freelance' | 'rent' | 'vendor' | 'other';
  averageDelayDuration?: 'under-1week' | '1-2weeks' | '2-4weeks' | '1-2months' | 'above-2months';
  sentMoreThan5Reminders?: 'yes' | 'no';
  averageDelayedAmount?: 'under-10k' | '10k-50k' | '50k-1lakh' | '1lakh-5lakh' | 'above-5lakh';
  experiencedMentalStress?: 'yes' | 'no';
}

export interface SurveyResponse {
  _id?: string;
  ideaSlug: string;
  companySlug: string;
  answersPart1?: AnswersPart1;
  answersPart2?: AnswersPart2;
  answersPart3?: Record<string, string>;
  earlyAccessInterest?: 'yes' | 'no';
  answers?: Record<string, string>;
  createdAt: Date;
}

export interface SurveyAnalysis {
  ideaSlug: string;
  companySlug: string;
  totalResponses: number;
  lendingStats: {
    lentMoneyPercent: number;
    facedDelaysPercent: number;
    lostMoneyPercent: number;
    avgLoanSizeDistribution: Record<string, number>;
    hesitatedPercent: number;
    wantPlatformPercent: number;
  };
  paymentStats: {
    experiencedDelaysPercent: number;
    mostCommonType: string;
    delayTypeDistribution: Record<string, number>;
    avgDelayDistribution: Record<string, number>;
    sent5PlusRemindersPercent: number;
    avgAmountDistribution: Record<string, number>;
    mentalStressPercent: number;
  };
  interestStats: {
    platformInterestPercent: number;
    earlyAccessPercent: number;
  };
  updatedAt: Date;
}
