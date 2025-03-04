import { parser } from 'stream-json';
import { streamValues } from 'stream-json/streamers/StreamValues';
import { v4 as uuidv4 } from 'uuid';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:openai:json-stream-processor');

/**
 * ハンドラー登録情報
 */
interface HandlerRegistration<T> {
  /** ハンドラーID */
  id: string;
  /** 型フィルター */
  filter: (value: unknown) => value is T;
  /** データハンドラー */
  handler: (data: T) => void;
}

/**
 * 汎用的なJSONストリーム処理のためのインターフェース
 */
export interface IJsonStreamProcessor {
  /**
   * ハンドラーを登録する
   * @param filter 型フィルター関数
   * @param handler データハンドラー関数
   * @returns ハンドラーID（登録解除時に使用）
   */
  registerHandler<T>(filter: (value: unknown) => value is T, handler: (data: T) => void): string;

  /**
   * 登録済みハンドラーを解除する
   * @param handlerId ハンドラーID
   * @returns 解除に成功したか
   */
  unregisterHandler(handlerId: string): boolean;

  /**
   * JSON文字列を処理する
   * @param jsonString 処理するJSON文字列
   */
  process(jsonString: string): void;

  /**
   * リソースを解放する
   */
  destroy(): void;
}

/**
 * 汎用JSONストリームプロセッサ
 * 不完全なJSONをストリーミング処理し、完全なオブジェクトが見つかったらハンドラーに通知する
 */
export class JsonStreamProcessor implements IJsonStreamProcessor {

  // パーサーコンポーネント
  private jsonParser = parser({ jsonStreaming: true });

  private jsonValueStream = streamValues();

  // ハンドラー登録情報
  private handlers: HandlerRegistration<unknown>[] = [];

  private isSetup = false;

  constructor() {
    // パーサー設定と初期化
    this.setup();
  }

  /**
   * パーサーの初期設定を行う
   */
  private setup(): void {
    if (this.isSetup) return;

    // リスナー上限を増やしてワーニングを防止
    this.jsonParser.setMaxListeners(20);
    this.jsonValueStream.setMaxListeners(20);

    // エラーハンドリング
    this.jsonParser.on('error', (err) => {
      logger.debug('JSON parser error (expected for partial data):', err.message);
    });

    this.jsonValueStream.on('error', (err) => {
      logger.debug('Stream values error (expected for partial data):', err.message);
    });

    // データハンドラ
    this.jsonValueStream.on('data', ({ value }) => {
      console.log({ value });
      if (!value) return;
      this.notifyHandlers(value);
    });

    // パイプライン接続
    this.jsonParser.pipe(this.jsonValueStream);
    this.isSetup = true;
  }

  /**
   * ハンドラーを登録する
   */
  registerHandler<T>(filter: (value: unknown) => value is T, handler: (data: T) => void): string {
    const id = uuidv4();
    this.handlers.push({
      id,
      filter: filter as (value: unknown) => value is unknown,
      handler: handler as (data: unknown) => void,
    });
    return id;
  }

  /**
   * 登録済みハンドラーを解除する
   */
  unregisterHandler(handlerId: string): boolean {
    const initialLength = this.handlers.length;
    this.handlers = this.handlers.filter(h => h.id !== handlerId);
    return this.handlers.length < initialLength;
  }

  /**
   * JSON文字列を処理する
   */
  process(jsonString: string): void {
    console.log({ jsonString });

    try {
      // パーサーに直接データを書き込む
      this.jsonParser.write(jsonString);
    }
    catch (e) {
      logger.debug('Error processing JSON data:', e);
    }
  }

  /**
   * リソースを解放する
   */
  destroy(): void {
    try {
      if (this.isSetup) {
        this.jsonParser.unpipe(this.jsonValueStream);
        this.jsonParser.removeAllListeners();
        this.jsonValueStream.removeAllListeners();
        this.handlers = [];
        this.jsonParser.end();
        this.jsonValueStream.end();
        this.isSetup = false;
      }
    }
    catch (e) {
      logger.debug('Error destroying JSON processor:', e);
    }
  }

  /**
   * 登録済みハンドラーに通知する
   */
  private notifyHandlers(value: unknown): void {
    for (const { filter, handler } of this.handlers) {
      try {
        if (filter(value)) {
          handler(value);
        }
      }
      catch (e) {
        logger.debug('Error in handler:', e);
      }
    }
  }

}
