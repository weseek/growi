import { jsonrepair } from 'jsonrepair';
import type { z } from 'zod';

import loggerFactory from '~/utils/logger';

import type { SseHelper } from '../utils/sse-helper';

import type { EditorAssistantMessageSchema } from './schema';
import { EditorAssistantDiffSchema } from './schema';

const logger = loggerFactory('growi:routes:apiv3:openai:edit:editor-stream-processor');

// 型定義
type EditorAssistantMessage = z.infer<typeof EditorAssistantMessageSchema>;
type EditorAssistantDiff = z.infer<typeof EditorAssistantDiffSchema>;

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
    && ('insert' in item || 'delete' in item || 'retain' in item);
};

/**
 * EditorAssistant用のストリームデータプロセッサ
 * JSONストリームから編集用のメッセージと差分を抽出する
 */
export class EditorStreamProcessor {

  // 最終応答データ
  private message: string | null = null;

  private replacements: EditorAssistantDiff[] = [];

  // 前回のコンテンツの最終要素のインデックス
  private lastContentIndex = -1;

  // 最後に送信した差分インデックス
  private lastSentDiffIndex = -1;

  // 送信済みの差分キー
  private sentDiffKeys = new Set<string>();

  constructor(private sseHelper: SseHelper) {
    this.sseHelper = sseHelper;
  }

  /**
   * JSONデータを処理する
   * @param jsonString JSON文字列
   */
  process(jsonString: string): void {
    try {
      const repairedJson = jsonrepair(jsonString);
      const parsedJson = JSON.parse(repairedJson);

      if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
        const contents = parsedJson.contents;

        // 現在のコンテンツの最終要素のインデックス
        const currentContentIndex = contents.length - 1;

        // メッセージの処理
        let messageUpdated = false;
        for (let i = contents.length - 1; i >= 0; i--) {
          const item = contents[i];
          if (isMessageItem(item)) {
            if (this.message !== item.message) {
              this.message = item.message;
              messageUpdated = true;
            }
            break;
          }
        }

        // 差分の処理
        let diffUpdated = false;
        let processedDiffIndex = -1;

        // 差分が含まれているか確認
        for (let i = 0; i < contents.length; i++) {
          const item = contents[i];
          if (!isDiffItem(item)) continue;

          const validDiff = EditorAssistantDiffSchema.safeParse(item);
          if (!validDiff.success) continue;

          const diff = validDiff.data;
          const key = this.getDiffKey(diff);

          // この差分がすでに送信済みかチェック
          if (this.sentDiffKeys.has(key)) continue;

          // 最終要素が変わった場合、または最後から2番目以前の要素の場合
          // → 差分が完成したと判断
          if (i < currentContentIndex || currentContentIndex > this.lastContentIndex) {
            this.replacements.push(diff);
            this.sentDiffKeys.add(key);
            diffUpdated = true;
            processedDiffIndex = Math.max(processedDiffIndex, i);
          }
        }

        // 最終インデックスを更新
        this.lastContentIndex = currentContentIndex;

        // 更新通知
        if (messageUpdated) {
          // メッセージは更新されたらすぐに通知
          this.notifyClient();
        }
        else if (diffUpdated && processedDiffIndex > this.lastSentDiffIndex) {
          // 差分は新しいインデックスの差分が確定した場合のみ通知
          this.lastSentDiffIndex = processedDiffIndex;
          this.notifyClient();
        }
      }
    }
    catch (e) {
      // パースエラーは無視（不完全なJSONなので）
      logger.debug('JSON parsing error (expected for partial data):', e);
    }
  }

  /**
   * 差分の一意キーを生成
   */
  private getDiffKey(diff: EditorAssistantDiff): string {
    if ('insert' in diff) return `insert-${diff.insert}`;
    if ('delete' in diff) return `delete-${diff.delete}`;
    if ('retain' in diff) return `retain-${diff.retain}`;
    return '';
  }

  /**
   * クライアントに通知
   */
  private notifyClient(): void {
    this.sseHelper.writeData({
      editorResponse: {
        message: this.message || '',
        replacements: this.replacements,
      },
    });
  }

  /**
   * 最終結果を送信
   */
  sendFinalResult(rawBuffer: string): void {
    try {
      const repairedJson = jsonrepair(rawBuffer);
      const parsedJson = JSON.parse(repairedJson);

      // 最後のデータから全ての差分を取得
      if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
        const contents = parsedJson.contents;

        // 未送信の差分があれば追加
        for (const item of contents) {
          if (!isDiffItem(item)) continue;

          const validDiff = EditorAssistantDiffSchema.safeParse(item);
          if (!validDiff.success) continue;

          const diff = validDiff.data;
          const key = this.getDiffKey(diff);

          // まだ送信していない差分を追加
          if (!this.sentDiffKeys.has(key)) {
            this.replacements.push(diff);
            this.sentDiffKeys.add(key);
          }
        }
      }

      // 最終通知（isDoneフラグ付き）
      this.sseHelper.writeData({
        editorResponse: {
          message: this.message || '',
          replacements: this.replacements,
        },
        isDone: true,
      });
    }
    catch (e) {
      logger.debug('Failed to parse final JSON response:', e);

      // エラー時も最終通知
      this.sseHelper.writeData({
        editorResponse: {
          message: this.message || '',
          replacements: this.replacements,
        },
        isDone: true,
      });
    }
  }

  /**
   * リソースを解放
   */
  destroy(): void {
    this.message = null;
    this.replacements = [];
    this.sentDiffKeys.clear();
    this.lastContentIndex = -1;
    this.lastSentDiffIndex = -1;
  }

}
