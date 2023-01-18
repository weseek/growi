import { HasObjectId } from '@growi/core';

export const QuestionType = { points: 'points', text: 'text' } as const;

type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export interface IQuestion {
  type: QuestionType
  text: string
}

export type IQuestionHasId = IQuestion & HasObjectId;
