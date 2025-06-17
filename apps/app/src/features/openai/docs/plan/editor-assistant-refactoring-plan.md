# GROWI エディターアシスタント改修計画 - クライアント・サーバー最適化

## 📋 概要

現在のGROWIエディターアシスタントをroo-codeの方式に倣って再実装し、適切なクライアント・サーバー責務分離を行う改修計画。

### 目的
- **精度向上**: Search/Replace方式による正確な編集
- **パフォーマンス最適化**: クライアントサイド処理によるレスポンス時間短縮
- **プライバシー強化**: ユーザーコンテンツのサーバー送信削減
- **リアルタイム性**: 即座のフィードバックとプレビュー機能
- **安全性向上**: Fuzzy matchingによる堅牢な処理
- **機能拡張**: 複数変更の一括処理

## 🔍 現状分析

### 現在のアーキテクチャ (All Server-side)
```
[AiAssistantSidebar] 
    ↓ useEditorAssistant
[Client] → postMessage (全コンテンツ) → [Server: edit/index.ts]
    ↓ OpenAI Stream
[LlmResponseStreamProcessor] → jsonrepair → parse
    ↓ SseDetectedDiff
[useEditorAssistant] → setDetectedDiff → yText更新
```

### 新アーキテクチャ (Client-Server Hybrid)
```
[AiAssistantSidebar] 
    ↓ useEditorAssistant
[Client] → リクエスト → [Server: edit/index.ts] 
    ↓ OpenAI Stream
[LlmResponseProcessor] → Search/Replace diff配列 
    ↓ SSE Stream
[ClientSearchReplaceProcessor] → Fuzzy Matching → Diff適用
    ↓ リアルタイム
[Editor] 更新 + プレビュー
```

### 課題と解決策
| 現在の課題 | 新アーキテクチャでの解決 |
|-----------|----------------------|
| **全コンテンツ送信** | diff配列のみ転送 |
| **サーバー負荷** | クライアントで処理分散 |
| **レスポンス遅延** | ローカル処理で高速化 |
| **単純置換** | Fuzzy Matching精度向上 |
| **エラー処理不足** | 詳細フィードバック |
| **複数変更リスク** | 安全な一括処理 |

## 🎯 改修目標

### 機能目標
- **精度**: 95%以上のdiff適用成功率（roo-code基準）
- **レスポンス**: 500ms以内のローカル処理完了
- **安全性**: 意図しない変更の完全防止
- **ユーザビリティ**: リアルタイムプレビューと詳細フィードバック

### アーキテクチャ目標
- **責務分離**: サーバーはLLM処理、クライアントは編集処理
- **効率性**: 最小限のデータ転送とサーバー負荷
- **拡張性**: 新機能の追加容易性
- **保守性**: 明確なモジュール分割

## ⭐ 進捗状況

### ✅ 完了済み

#### Phase 1: スキーマ・インターフェース更新
- **LlmEditorAssistantDiffSchema**: Search/Replace形式に対応（`search`, `replace`, `startLine`, `endLine`）
- **SseFinalizedSchema**: 詳細エラーレポート（`applicationResult.failedParts`）
- **型定義**: `ProcessorConfig`, `DiffError`, `MatchResult`等の追加

#### Phase 2 (Prototype): サーバーサイドエンジン実装
- **テキスト正規化**: Unicode正規化、roo-code互換パターン
- **設定管理**: 環境変数、階層設定、バリデーション  
- **ファジーマッチング**: Levenshtein距離、中央アウト検索
- **エラーハンドリング**: 6種類のエラー型、修正提案
- **Diff適用エンジン**: インデント保持、行デルタ追跡
- **メインプロセッサー**: 複数diff統合、位置ソート

### 🔄 現在の作業: アーキテクチャ修正

サーバーサイドプロトタイプからクライアントサイド実装への移行準備完了

### roo-code方式の適用とクライアント・サーバー最適化
- **Search/Replace形式**: 正確な検索条件による置換
- **クライアントサイド処理**: Fuzzy Matching、Diff適用をブラウザで実行
- **サーバー専門化**: LLM通信、プロンプト生成、セキュリティに特化
- **リアルタイムフィードバック**: 即座の処理状況表示とプレビュー
- **複数diff処理**: 一つのリクエストで複数箇所変更
- **詳細エラー報告**: 失敗原因と解決策の提示

### パフォーマンス目標
- **レスポンス時間**: 50%短縮（ローカル処理）
- **ネットワーク**: 80%削減（diff配列のみ転送）
- **サーバー負荷**: 60%削減（処理分散）

## 📝 段階別実装計画

### ✅ Phase 1: スキーマ・インターフェース更新 (完了)

#### 新しいDiffスキーマ (実装済み)
```typescript
// LlmEditorAssistantDiffSchema
export const LlmEditorAssistantDiffSchema = z.object({
  search: z.string().describe('正確に検索する内容（空白・インデント含む）'),
  replace: z.string().describe('置換後の内容'),
  startLine: z.number().optional().describe('検索開始行番号（1ベース）'),
  endLine: z.number().optional().describe('検索終了行番号（1ベース）'),
});
```

#### 処理結果型の拡張 (実装済み)
```typescript
// SseFinalizedSchema with applicationResult
type DiffApplicationResult = {
  success: boolean;
  appliedCount: number;
  failedParts?: Array<{
    search: string;
    error: string;
    suggestions?: string;
    similarity?: number;
  }>;
  content?: string;
};
```

### 🔄 Phase 2A: クライアントサイドエンジン実装 (次の優先タスク)

#### 2A.1 クライアントサイド処理クラス
```typescript
// apps/app/src/client/services/editor-assistant/
// - FuzzyMatchingEngine.ts      (ブラウザ最適化)
// - DiffApplicationEngine.ts    (エディター直接統合)
// - TextNormalization.ts        (ローカル処理)
// - ErrorHandler.ts             (リアルタイムフィードバック)
// - ClientSearchReplaceProcessor.ts (クライアント統合)
```

#### 2A.2 主要機能 (クライアントサイド)
- **ローカルFuzzy Matching**: `fastest-levenshtein`のブラウザ版
- **リアルタイム適用**: エディターへの直接更新
- **即座のフィードバック**: 処理状況のリアルタイム表示
- **プレビュー機能**: 変更前の確認機能

### Phase 2B: サーバーサイド最適化

#### 2B.1 サーバー責務の絞り込み
```typescript
// apps/app/src/features/openai/server/services/editor-assistant/
// - LlmResponseProcessor.ts     (パース専門)
// - PromptGenerator.ts          (roo-code形式)
// - ServerConfig.ts             (システム設定)
```

#### 2B.2 サーバー専門機能
- **LLM通信管理**: OpenAI APIとの効率的通信
- **プロンプト最適化**: roo-code形式のプロンプト生成
- **セキュリティ処理**: 認証・認可・レート制限

### Phase 3: ハイブリッド処理フロー統合

#### 3.1 新しい処理フロー
```
[Client] リクエスト → [Server] LLM通信 → diff配列生成
    ↓
[Client] Fuzzy Matching + Diff適用 → エディタ更新
```

#### 3.2 edit/index.ts統合
```typescript
// apps/app/src/features/openai/server/routes/edit/index.ts
// roo-code形式プロンプト採用
// diff配列レスポンス最適化
```

#### 3.3 useEditorAssistant統合  
```typescript
#### 3.1 処理フロー統合
```typescript
// apps/app/src/client/services/editor-assistant.tsx
// ClientSearchReplaceProcessor統合
// ハイブリッド処理フロー実装
```

```
[Client Request] → [Server: LLM Processing] → [SSE Stream] 
    ↓
[Client: Search/Replace Processor] → [Real-time Editor Update]
```

#### 3.2 SSE統合
- サーバーからdiff配列をストリーミング
- クライアントでリアルタイム処理・適用
- 処理結果の即座フィードバック

### Phase 4: UI・UX改善

#### 4.1 リアルタイムフィードバック
- 処理状況の即座表示
- diff適用のプレビュー機能  
- キャンセル・再試行機能

#### 4.2 詳細エラー表示
- 失敗原因の具体的説明
- 修正提案の表示
- 部分適用結果の確認

### Phase 5: ドキュメント更新

#### 5.1 アーキテクチャ図
- クライアント・サーバー責務分離図
- データフロー図
- エラーハンドリングフロー

#### 5.2 API仕様書  
- 新しいSSE形式
- クライアントサイドAPI
- 設定オプション

### Phase 6: テスト・検証

#### 6.1 単体テスト
- FuzzyMatcher精度テスト
- DiffApplicationEngine検証
- エラーハンドリング確認

#### 6.2 統合テスト
- エンドツーエンドフロー
- パフォーマンス測定
- ユーザビリティ検証

## 🔧 技術実装詳細

### 現在実装済みのプロトタイプ（サーバーサイド）

#### Fuzzy Matching アルゴリズム（→クライアント移行予定）
- **ライブラリ**: `fastest-levenshtein`
- **閾値**: 80%以上で一致判定  
- **検索方式**: Middle-out search（中央から外側へ）

#### エラーハンドリング（→クライアント移行予定）
```typescript
enum DiffErrorType {
  SEARCH_NOT_FOUND = 'search_not_found',
  MULTIPLE_MATCHES = 'multiple_matches', 
  CONTENT_MISMATCH = 'content_mismatch',
  LINE_RANGE_INVALID = 'line_range_invalid',
  SIMILARITY_TOO_LOW = 'similarity_too_low',
  PROCESSING_ERROR = 'processing_error'
}
```

### 新アーキテクチャの技術仕様

#### クライアントサイド処理
```typescript
// ブラウザ最適化されたFuzzy Matching
class ClientFuzzyMatcher {
  private threshold = 0.8;
  
  findBestMatch(searchText: string, content: string): MatchResult {
    // fastest-levenshtein のブラウザ版使用
    // リアルタイム類似度計算
  }
}

// エディター直接統合
class EditorDiffApplicator {
  applyToEditor(diffs: LlmEditorAssistantDiff[]): Promise<ApplicationResult> {
    // yText への直接更新
    // インデント保持
    // アンドゥ対応
  }
}
```

#### サーバーサイド専門化
```typescript
// LLM専門処理
class LlmResponseProcessor {
  parseStreamToDiffs(stream: ReadableStream): AsyncGenerator<LlmEditorAssistantDiff[]> {
    // ストリーミングパース
    // roo-code形式対応
  }
}

// プロンプト最適化
class PromptGenerator {
  generateSearchReplacePrompt(context: string): string {
    // roo-code形式指示
    // 複数diff対応
  }
}
```

### エラーハンドリング戦略（クライアント実装予定）
```typescript
type DiffError = {
  type: 'SEARCH_NOT_FOUND' | 'SIMILARITY_TOO_LOW' | 'MULTIPLE_MATCHES';
  message: string;
  details: {
    searchContent: string;
    bestMatch?: string;
    similarity?: number;
    suggestions: string[];
  };
};
```

### パフォーマンス最適化
- **クライアント処理**: ローカル実行による高速化
- **ネットワーク最適化**: diff配列のみ転送
- **メモリ効率**: ストリーミング処理継続
- **UI応答性**: リアルタイムフィードバック

## 📊 期待効果

| 項目 | 現在 | 改修後 | 改善率 |
|------|------|--------|--------|
| **編集精度** | 60-70% | 90-95% | +30-35% |
| **レスポンス時間** | 2-3秒 | 0.5-1秒 | 50-70% |
| **ネットワーク負荷** | 全コンテンツ | diff配列のみ | 80% |
| **サーバー負荷** | 高（全処理） | 低（LLMのみ） | 60% |
| **複雑変更対応** | 困難 | 対応可能 | - |
| **エラー情報詳細度** | 低 | 高 | +200% |
| **Fuzzy matching** | なし | あり (0.8閾値) | - |
| **複数diff処理** | 困難 | 効率的 | - |
| **リアルタイム性** | なし | あり | - |

## 🔍 roo-code調査結果の反映

### 主要な学習ポイント
- **テスト戦略**: 1186行の包括的テストケース参考
- **エラーハンドリング**: 段階的バリデーションと詳細エラーメッセージ  
- **設定管理**: 階層化設定と環境変数対応
- **文字正規化**: スマートクォート・Unicode正規化
- **パフォーマンス**: Middle-out検索と早期終了最適化
- **アーキテクチャ**: クライアント・サーバー責務分離の重要性

### 計画への反映
- **総工数**: 73.5時間 → **85時間** (+11.5時間)
- **タスク数**: 18個 → **22個** (+4個)  
- **新規追加**: クライアントサイド実装、アーキテクチャ分離、テスト強化
- **優先度変更**: Phase 2A（クライアント実装）を最優先に

## 🎯 実装優先順位

### 高優先度
1. ✅ スキーマ・インターフェース更新
2. ✅ Search/Replace処理エンジン実装

### 中優先度
3. ⏳ サーバーサイド統合
4. ⏳ クライアントサイド対応

### 低優先度
5. ⏳ UI改善・最適化
6. ⏳ パフォーマンス調整

## 🧪 検証計画

### テスト戦略
1. **単体テスト**: 処理エンジンの動作確認
2. **統合テスト**: サーバー・クライアント連携
3. **E2Eテスト**: 実際のユースケース検証
4. **パフォーマンステスト**: 大きなファイルでの処理速度

### 品質保証
- **Fuzzy matching精度**: 各種ケースでの類似度測定
- **エラーハンドリング**: 異常系での適切な処理
- **メモリ使用量**: 大きなファイルでのリソース消費

## 📚 参考資料

- [roo-code apply_diff implementation](https://github.com/RooCodeInc/Roo-Code/blob/main/src/core/tools/applyDiffTool.ts)
- [roo-code multi-search-replace strategy](https://github.com/RooCodeInc/Roo-Code/blob/main/src/core/diff/strategies/multi-search-replace.ts)
- [roo-code prompts](apps/app/src/features/openai/docs/roo-prompts.md)
- [roo-code investigation supplement](apps/app/src/features/openai/docs/plan/roo-code-investigation-supplement.md)

## 📝 備考

この改修により、GROWIのエディターアシスタントはroo-codeレベルの堅牢で精密な編集機能を実現し、ユーザーの生産性向上に大きく貢献することが期待される。

**重要な改善点:**
- **Fuzzy Matching**: 0.8閾値で80%類似度マッチング
- **文字正規化**: スマートクォート・Unicode対応
- **段階的バリデーション**: マーカー→内容→適用の3段階検証
- **詳細エラーハンドリング**: 修正提案付きエラーメッセージ
- **設定管理**: 環境変数と階層化設定システム

---
**作成日**: 2025-06-17  
**更新日**: 2025-06-17  
**ステータス**: 計画段階
