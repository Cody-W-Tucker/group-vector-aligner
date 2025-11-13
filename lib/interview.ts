export interface InterviewRow {
  id: string;
  user_id: string;
  responses: InterviewResponses;
  completed_at: string;
  status: string;
}

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
    question: 'What do you hope to gain from this group?',
    type: 'text' as const,
  },
  {
    key: 'sponsorship' as keyof InterviewResponses,
    question: 'Do you see yourself becoming a contributing member?',
    type: 'choice' as const,
    subQuestion: 'If yes, how would you like to contribute?',
    choices: ['investment', 'work', 'connections'],
  },
  {
    key: 'resources' as keyof InterviewResponses,
    question: 'Are there resources that fit with this initiative that you\'re open to sharing?',
    type: 'choice' as const,
    subQuestion: 'If yes, what are they',
  },
  {
    key: 'leadership' as keyof InterviewResponses,
    question: 'Are you open to guiding the initiative in a leadership capacity?',
    type: 'choice' as const,
    subQuestion: 'If yes, what area of responsibilities fit your skills?',
  },
  {
    key: 'deliverables' as keyof InterviewResponses,
    question: 'If successful, which deliverables/assets excite you most about creating together?',
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
    question: 'What investments outside of what you mentioned are needed to complete?',
    type: 'text' as const,
  },
  {
    key: 'benefits' as keyof InterviewResponses,
    question: 'What value or benefits will investors get because of this initiative?',
    type: 'text' as const,
  },
]
