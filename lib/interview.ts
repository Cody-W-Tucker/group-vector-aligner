export interface InterviewResponses {
  purpose: string;
  sponsorship: { willing: boolean; how?: string; type?: 'investment' | 'work' | 'connections' };
  resources: string;
  leadership: { willing: boolean; how?: string };
  deliverables: string;
  plan: string;
  change: string;
  investment: string;
  benefits: string;
}

export const QUESTIONS = [
  {
    key: 'purpose' as keyof InterviewResponses,
    question: 'Why do you want to create this initiative?',
    type: 'text' as const,
  },
  {
    key: 'sponsorship' as keyof InterviewResponses,
    question: 'Are you open to sponsoring this initiative?',
    type: 'choice' as const,
    subQuestion: 'If yes, how would you like to sponsor?',
    choices: ['investment', 'work', 'connections'],
  },
  {
    key: 'resources' as keyof InterviewResponses,
    question: 'Are there resources you have or are aware of that fit with this initiative that you\'re open to sharing?',
    type: 'text' as const,
  },
  {
    key: 'leadership' as keyof InterviewResponses,
    question: 'Are you open to guiding the initiative in a leadership capacity?',
    type: 'choice' as const,
    subQuestion: 'If yes, how would you like to guide?',
  },
  {
    key: 'deliverables' as keyof InterviewResponses,
    question: 'What are the important deliverables/assets that are important to this initiative in your mind?',
    type: 'text' as const,
  },
  {
    key: 'plan' as keyof InterviewResponses,
    question: 'Sketch a rough draft plan for what/how to complete this initiative.',
    type: 'text' as const,
  },
  {
    key: 'change' as keyof InterviewResponses,
    question: 'What processes will help adapt to changes/challenges when they come up?',
    type: 'text' as const,
  },
  {
    key: 'investment' as keyof InterviewResponses,
    question: 'What investments outside of what you mentioned here will we need?',
    type: 'text' as const,
  },
  {
    key: 'benefits' as keyof InterviewResponses,
    question: 'What value or benefits will investors get because of this initiative?',
    type: 'text' as const,
  },
]