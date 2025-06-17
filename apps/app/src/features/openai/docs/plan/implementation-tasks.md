# 実装タスクリスト

## 📋 Phase 1: スキーマ・インターフェース更新

### ✅ 完了タスク
- [ ] 既存スキーマの分析と理解

### 🎯 実装タスク

#### 1.1 LLM Response Schemas更新
- [ ] **ファイル**: `apps/app/src/features/openai/interfaces/editor-assistant/llm-response-schemas.ts`
- [ ] **タスク**: 
  - [ ] `LlmEditorAssistantDiffSchema`をSearch/Replace形式に更新
  - [ ] バックワード互換性の確保
  - [ ] TypeScript型定義の更新
- [ ] **推定工数**: 2時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 1.2 SSE Schemas更新  
- [ ] **ファイル**: `apps/app/src/features/openai/interfaces/editor-assistant/sse-schemas.ts`
- [ ] **タスク**:
  - [ ] 新しいDiff形式に対応したSSEスキーマ
  - [ ] エラー詳細情報の追加
- [ ] **推定工数**: 1時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 1.3 新しい型定義の追加
- [ ] **ファイル**: `apps/app/src/features/openai/interfaces/editor-assistant/types.ts` (新規)
- [ ] **タスク**:
  - [ ] `DiffApplicationResult`型の定義
  - [ ] `DiffError`型の定義
  - [ ] `ProcessorConfig`型の定義
- [ ] **推定工数**: 1時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

---

## 📋 Phase 2: Search/Replace処理エンジン実装

### 🎯 実装タスク

#### 2.1 Fuzzy Matching ユーティリティ
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/fuzzy-matching.ts` (新規)
- [ ] **タスク**:
  - [ ] `fastest-levenshtein`の依存関係追加
  - [ ] `FuzzyMatcher`クラスの実装
  - [ ] 類似度計算ロジック
  - [ ] Middle-out検索アルゴリズム
  - [ ] 文字列正規化機能
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 2.2 Diff適用エンジン
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/diff-application-engine.ts` (新規)
- [ ] **タスク**:
  - [ ] 単一diff適用ロジック
  - [ ] インデント保持機能
  - [ ] 行番号管理
  - [ ] 置換実行ロジック
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定  
- [ ] **優先度**: 高

#### 2.3 エラーハンドリング
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/error-handlers.ts` (新規)
- [ ] **タスク**:
  - [ ] `ErrorHandler`クラスの実装
  - [ ] エラー詳細情報の生成
  - [ ] 推奨アクションの提供
  - [ ] ログ出力機能
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 2.4 メイン処理エンジン
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/multi-search-replace-processor.ts` (新規)
- [ ] **タスク**:
  - [ ] `MultiSearchReplaceProcessor`クラスの実装
  - [ ] 複数diff処理ロジック
  - [ ] バリデーション機能
  - [ ] パフォーマンス最適化
  - [ ] 設定管理
- [ ] **推定工数**: 8時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 2.5 テキスト正規化ユーティリティ
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/text-normalization.ts` (新規)
- [ ] **タスク**:
  - [ ] スマートクォート・タイポグラフィ文字の正規化
  - [ ] Unicode正規化機能（NFC）
  - [ ] 空白文字の正規化
  - [ ] roo-code互換の正規化マップ実装
- [ ] **推定工数**: 2時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 2.6 設定管理システム
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/config.ts` (新規)
- [ ] **タスク**:
  - [ ] EditorAssistantConfig型の定義
  - [ ] 環境変数からの設定読み込み
  - [ ] デフォルト値の階層化管理
  - [ ] 設定値のバリデーション
- [ ] **推定工数**: 1.5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 2.7 単体テスト
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/__tests__/` (新規ディレクトリ)
- [ ] **タスク**:
  - [ ] `fuzzy-matching.test.ts`
  - [ ] `text-normalization.test.ts`
  - [ ] `diff-application-engine.test.ts`
  - [ ] `multi-search-replace-processor.test.ts`
  - [ ] roo-code互換のテストケース実装
- [ ] **推定工数**: 8時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

---

## 📋 Phase 3: サーバーサイド統合

### 🎯 実装タスク

#### 3.1 LlmResponseStreamProcessor更新
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/llm-response-stream-processor.ts`
- [ ] **タスク**:
  - [ ] Search/Replace形式のパース対応
  - [ ] 新しいprocessor連携
  - [ ] エラーハンドリング統合
  - [ ] パフォーマンス最適化
- [ ] **推定工数**: 5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 3.2 edit/index.ts更新
- [ ] **ファイル**: `apps/app/src/features/openai/server/routes/edit/index.ts`
- [ ] **タスク**:
  - [ ] プロンプトのroo-code形式更新
  - [ ] 新しいprocessorとの統合
  - [ ] エラーレスポンスの改善
  - [ ] ログ出力の追加
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 3.3 依存関係の追加
- [ ] **ファイル**: `apps/app/package.json`
- [ ] **タスク**:
  - [ ] `fastest-levenshtein`パッケージの追加
  - [ ] 型定義ファイルの追加
- [ ] **推定工数**: 0.5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

---

## 📋 Phase 4: クライアントサイド対応

### 🎯 実装タスク

#### 4.1 useEditorAssistant更新
- [ ] **ファイル**: `apps/app/src/features/openai/client/services/editor-assistant.tsx`
- [ ] **タスク**:
  - [ ] 新しいdiff形式への対応
  - [ ] エラーハンドリング強化
  - [ ] 詳細なエラー表示
  - [ ] 処理状況の可視化
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 4.2 AiAssistantSidebar更新
- [ ] **ファイル**: `apps/app/src/features/openai/client/components/AiAssistant/AiAssistantSidebar/AiAssistantSidebar.tsx`
- [ ] **タスク**:
  - [ ] 新しいエラー表示UI
  - [ ] 部分適用結果の表示
  - [ ] ユーザーフィードバック改善
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

---

## 📋 Phase 5: プロンプト・ドキュメント更新

### 🎯 実装タスク

#### 5.1 プロンプト更新
- [ ] **ファイル**: `apps/app/src/features/openai/server/routes/edit/index.ts` (instruction関数)
- [ ] **タスク**:
  - [ ] roo-code形式の指示追加
  - [ ] Search/Replaceブロックの説明
  - [ ] エラー対処方法の記載
  - [ ] 多言語対応の確認
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 5.2 ドキュメント更新
- [ ] **ファイル**: `apps/app/src/features/openai/docs/`
- [ ] **タスク**:
  - [ ] README.mdの更新
  - [ ] API仕様書の更新
  - [ ] 使用例の追加
  - [ ] トラブルシューティング
- [ ] **推定工数**: 2時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

---

## 📋 Phase 6: テスト・検証

### 🎯 実装タスク

#### 6.1 統合テスト
- [ ] **ファイル**: `apps/app/test/integration/editor-assistant/` (新規)
- [ ] **タスク**:
  - [ ] サーバー・クライアント連携テスト
  - [ ] エラーケースの検証
  - [ ] パフォーマンステスト
- [ ] **推定工数**: 8時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 6.2 E2Eテスト
- [ ] **ファイル**: `apps/app/playwright/editor-assistant/` (新規)
- [ ] **タスク**:
  - [ ] 実際のユースケース検証
  - [ ] UI操作テスト
  - [ ] ブラウザ互換性確認
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

#### 6.3 パフォーマンステスト
- [ ] **ファイル**: `apps/app/test/performance/editor-assistant/` (新規)
- [ ] **タスク**:
  - [ ] 大きなファイルでのテスト
  - [ ] 複数diff処理のベンチマーク
  - [ ] メモリ使用量の測定
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

---

## 📊 進捗管理

### 全体進捗
- **総タスク数**: 20タスク
- **完了**: 0タスク (0%)
- **進行中**: 0タスク (0%)
- **未着手**: 20タスク (100%)

### Phase別進捗
| Phase | タスク数 | 完了 | 進捗率 | 推定総工数 |
|-------|----------|------|--------|------------|
| Phase 1 | 3 | 0 | 0% | 4時間 |
| Phase 2 | 7 | 0 | 0% | 30.5時間 |
| Phase 3 | 3 | 0 | 0% | 9.5時間 |
| Phase 4 | 2 | 0 | 0% | 10時間 |
| Phase 5 | 2 | 0 | 0% | 5時間 |
| Phase 6 | 3 | 0 | 0% | 18時間 |
| **合計** | **20** | **0** | **0%** | **77時間** |

### 優先度別
- **高優先度**: 9タスク (50%)
- **中優先度**: 6タスク (33%)
- **低優先度**: 3タスク (17%)

### 推定スケジュール
- **開発期間**: 約2-3週間 (1人稼働)
- **クリティカルパス**: Phase 1 → Phase 2 → Phase 3
- **並行可能**: Phase 4以降は部分的に並行実装可能

---

## 🎯 次のアクション

### 即座に着手可能
1. **Phase 1.1**: LLM Response Schemas更新
2. **Phase 1.3**: 新しい型定義の追加
3. **Phase 2.7**: 単体テストの設計

### 依存関係あり
- Phase 2はPhase 1完了後
- Phase 3はPhase 2完了後
- Phase 4はPhase 3完了後

### リスクと対策
- **技術リスク**: Fuzzy matchingの精度調整
  - **対策**: 段階的な閾値調整とテスト
- **互換性リスク**: 既存機能への影響
  - **対策**: フィーチャーフラグでの段階的移行

---
**ファイル**: `implementation-tasks.md`  
**作成日**: 2025-06-17  
**更新日**: 2025-06-17  
**ステータス**: 計画段階
