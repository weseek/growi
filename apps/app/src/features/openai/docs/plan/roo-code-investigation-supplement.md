# roo-code調査結果：計画補強レポート

## 📋 追加調査で判明した重要な知見

### 1. 🧪 テスト戦略の詳細

#### roo-codeのテストアプローチ
- **包括的なテストカバレッジ**: 1186行の詳細なテストファイル
- **実際のコード例を使用**: 関数、インデント、タブ/スペース混在等の実用的なテスト
- **エラーケースの徹底検証**: マーカー検証、シーケンス検証等

#### GROWIに適用すべきテスト戦略
```typescript
// 追加すべきテストケース
describe('Multi-Search-Replace Integration Tests', () => {
  // 1. 基本的なSearch/Replace
  it('should handle exact matches')
  it('should handle fuzzy matches within threshold')
  
  // 2. インデント・空白の処理
  it('should preserve indentation when replacing')
  it('should handle tab-based indentation')
  it('should preserve mixed tabs and spaces')
  
  // 3. 複数diff処理
  it('should process multiple diffs in correct order')
  it('should handle partial failures gracefully')
  
  // 4. エラーハンドリング
  it('should detect malformed marker sequences')
  it('should provide helpful error messages')
  it('should suggest fixes for common mistakes')
  
  // 5. パフォーマンス
  it('should handle large files efficiently')
  it('should complete middle-out search within time limits')
})
```

### 2. 🔧 設定管理パターン

#### roo-codeの設定アーキテクチャ
- **デフォルト値の明確化**: `fuzzyThreshold = 1.0` (完全一致), `bufferLines = 40`
- **設定の階層化**: デフォルト → コンストラクタ → 環境変数
- **TypeScript型安全性**: 設定オプションの型定義

#### GROWIでの設定実装案
```typescript
// apps/app/src/features/openai/server/services/editor-assistant/config.ts
export interface EditorAssistantConfig {
  fuzzyThreshold: number;      // デフォルト: 0.8 (roo-codeは1.0だが、GROWIは緩める)
  bufferLines: number;         // デフォルト: 40
  preserveIndentation: boolean; // デフォルト: true
  enableMiddleOutSearch: boolean; // デフォルト: true
  maxDiffBlocks: number;       // デフォルト: 10
}

export const DEFAULT_CONFIG: EditorAssistantConfig = {
  fuzzyThreshold: 0.8,
  bufferLines: 40,
  preserveIndentation: true,
  enableMiddleOutSearch: true,
  maxDiffBlocks: 10,
};

// 環境変数からの設定読み込み
export function loadConfigFromEnv(): Partial<EditorAssistantConfig> {
  return {
    fuzzyThreshold: parseFloat(process.env.GROWI_EDITOR_ASSISTANT_FUZZY_THRESHOLD || '0.8'),
    bufferLines: parseInt(process.env.GROWI_EDITOR_ASSISTANT_BUFFER_LINES || '40'),
    // ...
  };
}
```

### 3. 🛡️ エラーハンドリングの高度化

#### roo-codeのエラーハンドリング特徴
- **段階的バリデーション**: マーカーシーケンス → 内容検証 → 適用処理
- **具体的エラーメッセージ**: 行番号、期待値、実際値を含む詳細情報
- **修正提案**: エスケープ方法、正しい形式例を提示

#### GROWIでの強化されたエラーハンドリング
```typescript
// apps/app/src/features/openai/server/services/editor-assistant/error-types.ts
export interface DetailedDiffError {
  type: 'MARKER_SEQUENCE_ERROR' | 'SIMILARITY_TOO_LOW' | 'MULTIPLE_MATCHES' | 'CONTENT_ERROR';
  message: string;
  line?: number;
  details: {
    searchContent: string;
    bestMatch?: string;
    similarity?: number;
    suggestions: string[];
    correctFormat?: string;
  };
}

export class EnhancedErrorHandler {
  static createMarkerSequenceError(found: string, expected: string, line: number): DetailedDiffError {
    return {
      type: 'MARKER_SEQUENCE_ERROR',
      message: `Invalid marker '${found}' at line ${line}. Expected: ${expected}`,
      line,
      details: {
        searchContent: found,
        suggestions: [
          'Check marker sequence: <<<<<<< SEARCH → ======= → >>>>>>> REPLACE',
          'Escape special markers in content with backslash (\\)',
          'Ensure no extra or missing separators'
        ],
        correctFormat: `<<<<<<< SEARCH\n:start_line: X\n-------\n[search content]\n=======\n[replace content]\n>>>>>>> REPLACE`
      }
    };
  }
}
```

### 4. 🎛️ 正規化とファジーマッチング

#### roo-codeの文字正規化
- **スマートクォート対応**: `\u201C\u201D` → `"`, `\u2018\u2019` → `'`
- **タイポグラフィ文字**: `\u2026` → `...`, `\u2014` → `-`
- **空白正規化**: 連続空白 → 単一空白

#### GROWIでの実装
```typescript
// apps/app/src/features/openai/server/services/editor-assistant/text-normalization.ts
import { NORMALIZATION_MAPS } from './constants';

export function normalizeForFuzzyMatch(text: string): string {
  return text
    .replace(/[\u201C\u201D]/g, '"')  // スマートダブルクォート
    .replace(/[\u2018\u2019]/g, "'")  // スマートシングルクォート
    .replace(/\u2026/g, '...')        // 省略記号
    .replace(/\u2014/g, '-')          // emダッシュ
    .replace(/\u2013/g, '-')          // enダッシュ
    .replace(/\u00A0/g, ' ')          // ノンブレーキングスペース
    .normalize('NFC');                // Unicode正規化
}
```

### 5. 📈 パフォーマンス最適化

#### roo-codeのパフォーマンス戦略
- **Middle-out検索**: 中央から外側への効率的な検索アルゴリズム
- **早期終了**: 閾値以上の一致が見つかったら検索停止
- **メモリ効率**: 必要最小限の文字列操作

#### GROWIでの最適化実装
```typescript
// パフォーマンス最適化された検索
private findBestMatchOptimized(
  lines: string[],
  searchChunk: string,
  startIndex: number,
  endIndex: number
): MatchResult {
  const searchLines = searchChunk.split(/\r?\n/);
  const searchLength = searchLines.length;
  
  // 早期終了条件: 完全一致が見つかったら即座に返す
  let bestScore = 0;
  let bestMatch: MatchResult | null = null;
  
  // Middle-out検索の実装
  const midPoint = Math.floor((startIndex + endIndex) / 2);
  for (let offset = 0; offset <= Math.floor((endIndex - startIndex) / 2); offset++) {
    // 左側チェック
    if (midPoint - offset >= startIndex) {
      const similarity = this.calculateSimilarity(/* ... */);
      if (similarity === 1.0) return { /* 完全一致 */ };
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = { /* 結果 */ };
      }
    }
    
    // 右側チェック
    if (midPoint + offset <= endIndex - searchLength) {
      // 同様の処理
    }
    
    // 閾値を超えた場合の早期終了
    if (bestScore >= this.fuzzyThreshold) break;
  }
  
  return bestMatch || { found: false, score: 0 };
}
```

## 🔄 計画への反映事項

### 1. 実装タスクの追加・修正

#### Phase 2への追加タスク:
- **2.5 テキスト正規化ユーティリティ** (2時間)
  - スマートクォート、タイポグラフィ文字の正規化
  - Unicode正規化機能
  
- **2.6 設定管理システム** (1.5時間)
  - 環境変数からの設定読み込み
  - デフォルト値の定義

#### Phase 6への追加テスト:
- **6.4 詳細エラーハンドリングテスト** (3時間)
  - マーカーシーケンス検証
  - エラーメッセージの内容確認
  
- **6.5 パフォーマンステスト** (2時間)
  - 大きなファイルでの処理速度測定
  - メモリ使用量の確認

### 2. 技術仕様の精密化

#### Fuzzy Matching閾値:
- **roo-code**: 1.0 (完全一致のみ)
- **GROWI**: 0.8 (80%の類似度) - より寛容な設定

#### エラーメッセージ:
- roo-codeと同レベルの詳細なエラー情報
- 日本語でのわかりやすい説明
- 修正方法の具体的な提案

### 3. 見積もり工数の調整

| フェーズ | 当初見積もり | 調整後見積もり | 差分 |
|---------|------------|--------------|------|
| Phase 2 | 27時間 | 30.5時間 | +3.5時間 |
| Phase 6 | 18時間 | 23時間 | +5時間 |
| **合計** | **73.5時間** | **82時間** | **+8.5時間** |

## 🎯 次のアクションアイテム

### 高優先度
1. ✅ **テスト仕様の詳細化**: roo-codeのテストパターンを参考にした包括的テスト計画
2. ✅ **エラーハンドリング強化**: 段階的バリデーションと詳細エラーメッセージ
3. ✅ **設定管理システム**: 環境変数対応と階層化設定

### 中優先度
4. ⏳ **パフォーマンス最適化**: Middle-out検索と早期終了の実装
5. ⏳ **文字正規化**: Unicode正規化とスマートクォート対応

### 低優先度
6. ⏳ **監視・ログ**: 処理時間とメモリ使用量の監視機能

---

この調査により、GROWIのエディターアシスタントをroo-codeレベルの堅牢性と精度を持つシステムに改修するための、より具体的で実用的な計画が完成しました。

**作成日**: 2025-06-17  
**関連ファイル**: `editor-assistant-refactoring-plan.md`, `technical-implementation-details.md`, `implementation-tasks.md`
