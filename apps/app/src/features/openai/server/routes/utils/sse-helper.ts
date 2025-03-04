import type { Response } from 'express';

import type { StreamErrorCode } from '../../../interfaces/message-error';

/**
 * SSE通信を簡略化するためのインターフェース
 */
export interface ISseHelper {
  /**
   * SSEフォーマットでデータを送信する
   */
  writeData(data: unknown): void;

  /**
   * SSEフォーマットでエラーを送信する
   */
  writeError(message: string, code?: StreamErrorCode): void;

  /**
   * レスポンスを終了する
   */
  end(): void;
}

/**
 * SSEヘルパークラス
 * レスポンスオブジェクトにSSEフォーマットでデータを書き込む機能を提供
 */
export class SseHelper implements ISseHelper {

  constructor(private res: Response) {}

  /**
   * SSEフォーマットでデータを送信する
   */
  writeData(data: unknown): void {
    this.res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * SSEフォーマットでエラーを送信する
   */
  writeError(message: string, code?: StreamErrorCode): void {
    this.res.write(`error: ${JSON.stringify({ code, message })}\n\n`);
  }

  /**
   * レスポンスを終了する
   */
  end(): void {
    this.res.end();
  }

}
