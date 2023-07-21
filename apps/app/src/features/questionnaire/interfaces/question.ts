import type { HasObjectId } from '@growi/core/dist/interfaces';

export const QuestionType = { points: 'points', text: 'text' } as const;

type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export interface IQuestion {
  type: QuestionType
  text: {
    ja_JP: string
    en_US: string
  }
}

export type IQuestionHasId = IQuestion & HasObjectId;
