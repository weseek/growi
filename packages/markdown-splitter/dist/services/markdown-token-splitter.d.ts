import { TiktokenModel } from 'js-tiktoken';

export declare function splitMarkdownIntoChunks(markdownText: string, model: TiktokenModel, maxToken?: number): Promise<string[]>;
