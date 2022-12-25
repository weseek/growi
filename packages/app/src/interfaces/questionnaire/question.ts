export const QuestionType = { points: 'points', text: 'text' } as const;

type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export interface IQuestion {
  type: QuestionType // アンケートの回答形式
  text: string // アンケートの文章
}
