import type { z } from 'zod';

import loggerFactory from '~/utils/logger';

import { JsonStreamProcessor } from '../utils/json-stream-processor';
import type { SseHelper } from '../utils/sse-helper';

import type { EditorAssistantMessageSchema } from './schema';
import { EditorAssistantDiffSchema } from './schema';

const logger = loggerFactory('growi:routes:apiv3:openai:edit:editor-stream-processor');

// 型定義
type EditorAssistantMessage = z.infer<typeof EditorAssistantMessageSchema>;
type EditorAssistantDiff = z.infer<typeof EditorAssistantDiffSchema>;

// -----------------------------------------------------------------------------
// ユーティリティ関数 (外形のみ)
// -----------------------------------------------------------------------------

/**
 * 型ガード: メッセージ型かどうかを判定する
 */
const isMessageItem = (item: unknown): item is EditorAssistantMessage => {
  return typeof item === 'object' && item !== null && 'message' in item;
};

/**
 * 型ガード: 差分型かどうかを判定する
 */
const isDiffItem = (item: unknown): item is EditorAssistantDiff => {
  return typeof item === 'object' && item !== null
    && 'start' in item && 'end' in item && 'text' in item;
};

/**
 * コンテンツからメッセージと差分を抽出する
 */
const extractContentItems = (contents: unknown[]) => {
  const messages: string[] = [];
  const replacements: EditorAssistantDiff[] = [];

  contents.forEach((item) => {
    if (isMessageItem(item)) {
      messages.push(item.message);
    }
    else if (isDiffItem(item)) {
      const validDiff = EditorAssistantDiffSchema.safeParse(item);
      if (validDiff.success) {
        replacements.push(validDiff.data);
      }
    }
  });

  return { messages, replacements };
};

/**
 * エディターアシスタントのレスポンスデータを作成する
 */
const createEditorResponse = (messages: string[], replacements: EditorAssistantDiff[], isDone = false) => ({
  editorResponse: {
    message: messages.length > 0 ? messages[messages.length - 1] : '',
    replacements,
  },
  ...(isDone ? { isDone: true } : {}),
});

// -----------------------------------------------------------------------------
// エディターデータプロセッサ実装 (外形のみ)
// -----------------------------------------------------------------------------

/**
 * EditorAssistant用のストリームデータプロセッサ
 * JSONストリームから編集用のメッセージと差分を抽出する
 */
export class EditorStreamProcessor {

  // JSONプロセッサ
  private jsonProcessor: JsonStreamProcessor;

  // 確認済みのデータ
  private messages: string[] = [];

  private replacements: EditorAssistantDiff[] = [];

  // ハンドラーID
  private handlerIds: string[] = [];

  constructor(private sseHelper: SseHelper) {
    // JsonStreamProcessorの初期化
    this.jsonProcessor = new JsonStreamProcessor();
    this.setupHandlers();
  }

  /**
   * 処理ハンドラーを設定
   */
  private setupHandlers(): void {
    // コンテンツ配列ハンドラー
    this.handlerIds.push(
      this.jsonProcessor.registerHandler(
        (value): value is { contents: unknown[] } => {
          return typeof value === 'object' && value !== null && 'contents' in value && Array.isArray(value.contents);
        },
        data => this.handleContents(data.contents),
      ),
    );

    // 単一メッセージハンドラー
    this.handlerIds.push(
      this.jsonProcessor.registerHandler(
        isMessageItem,
        message => this.handleMessage(message.message),
      ),
    );

    // 単一差分ハンドラー
    this.handlerIds.push(
      this.jsonProcessor.registerHandler(
        isDiffItem,
        diff => this.handleDiff(diff),
      ),
    );
  }

  /**
   * JSON文字列を処理
   */
  process(jsonString: string): void {
    this.jsonProcessor.process(jsonString);
  }

  /**
   * コンテンツ配列を処理
   */
  private handleContents(contents: unknown[]): void {
    const extracted = extractContentItems(contents);

    let hasUpdates = false;

    // メッセージ処理
    extracted.messages.forEach((msg) => {
      if (!this.messages.includes(msg)) {
        this.messages.push(msg);
        hasUpdates = true;
      }
    });

    // 差分処理
    extracted.replacements.forEach((diff) => {
      const existingIndex = this.replacements.findIndex(r => r.start === diff.start && r.end === diff.end);
      if (existingIndex >= 0) {
        this.replacements[existingIndex] = diff;
      }
      else {
        this.replacements.push(diff);
      }
      hasUpdates = true;
    });

    // 更新があればクライアントに通知
    if (hasUpdates) {
      this.notifyClient();
    }
  }

  /**
   * 単一メッセージを処理
   */
  private handleMessage(message: string): void {
    if (!this.messages.includes(message)) {
      this.messages.push(message);
      this.notifyClient();
    }
  }

  /**
   * 単一差分を処理
   */
  private handleDiff(diff: EditorAssistantDiff): void {
    const validDiff = EditorAssistantDiffSchema.safeParse(diff);
    if (!validDiff.success) return;

    const existingIndex = this.replacements.findIndex(r => r.start === diff.start && r.end === diff.end);
    if (existingIndex >= 0) {
      this.replacements[existingIndex] = validDiff.data;
    }
    else {
      this.replacements.push(validDiff.data);
    }

    this.notifyClient();
  }

  /**
   * クライアントに通知
   */
  private notifyClient(): void {
    this.sseHelper.writeData(createEditorResponse(this.messages, this.replacements));
  }

  /**
   * リソースを解放
   */
  destroy(): void {
    // ハンドラー登録解除
    this.handlerIds.forEach((id) => {
      this.jsonProcessor.unregisterHandler(id);
    });

    // プロセッサ解放
    this.jsonProcessor.destroy();
  }

  /**
   * 最終結果を送信
   */
  sendFinalResult(rawBuffer: string): void {
    try {
      // 完全なJSONをパース
      const parsedJson = JSON.parse(rawBuffer);

      if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
        // 最終的なコンテンツを抽出
        const extracted = extractContentItems(parsedJson.contents);

        // 最終データを送信（完全なデータがあればそちらを優先）
        this.sseHelper.writeData(createEditorResponse(
          extracted.messages.length > 0 ? extracted.messages : this.messages,
          extracted.replacements.length > 0 ? extracted.replacements : this.replacements,
          true, // 完了フラグ
        ));
      }
      else if (this.messages.length > 0 || this.replacements.length > 0) {
        // パース結果が期待形式でなくても蓄積データがあれば送信
        this.sseHelper.writeData(createEditorResponse(this.messages, this.replacements, true));
      }
      else {
        // データがない場合はエラー
        this.sseHelper.writeError('Failed to parse assistant response as JSON', 'INVALID_RESPONSE_FORMAT');
      }
    }
    catch (e) {
      logger.debug('Failed to parse final JSON response:', e);

      // パースエラー時も蓄積データがあれば送信
      if (this.messages.length > 0 || this.replacements.length > 0) {
        this.sseHelper.writeData(createEditorResponse(this.messages, this.replacements, true));
      }
      else {
        this.sseHelper.writeError('Failed to parse assistant response as JSON', 'INVALID_RESPONSE_FORMAT');
      }
    }
  }

  /**
   * 現在のメッセージリスト
   */
  get messagesList(): string[] {
    return this.messages;
  }

  /**
   * 現在の差分リスト
   */
  get replacementsList(): EditorAssistantDiff[] {
    return this.replacements;
  }

}
