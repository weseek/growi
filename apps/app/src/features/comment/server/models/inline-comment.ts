import type { IInlineComment } from '@growi/core';
import mongoose from 'mongoose';

import type { CommentDocument, CommentModel } from './comment';

import './comment'; // initialize model

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InlineCommentDocument extends IInlineComment, Omit<CommentDocument, 'inline'> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InlineCommentModel extends CommentModel<InlineCommentDocument> {
}

export const InlineComment = mongoose.model<IInlineComment, InlineCommentModel>('Comment');
