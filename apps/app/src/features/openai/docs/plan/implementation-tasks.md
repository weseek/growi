# 実装タスクリスト - クライアント・サーバー分離アーキテクチャ

## 📋 Phase 1: スキーマ・インターフェース更新 ✅ 完了

### ✅ 完了タスク
- [x] `LlmEditorAssistantDiffSchema`をSearch/Replace形式に更新
- [x] `SseFinalizedSchema`にエラー詳細情報追加  
- [x] 新しい型定義の追加 (`ProcessorConfig`, `DiffError`, `MatchResult`等)
- [x] バックワード互換性の確保
- [x] TypeScript型定義の更新

### 完了ファイル
- ✅ `apps/app/src/features/openai/interfaces/editor-assistant/llm-response-schemas.ts`
- ✅ `apps/app/src/features/openai/interfaces/editor-assistant/sse-schemas.ts`  
- ✅ `apps/app/src/features/openai/interfaces/editor-assistant/types.ts`

**総工数**: 4時間 (完了)

---

## 📋 Phase 2A: クライアントサイドEngine実装 🎯 最優先

### アーキテクチャ方針
**roo-code方式**: パフォーマンス・プライバシー・リアルタイム性を重視し、Fuzzy MatchingとDiff適用をクライアントサイドで実行

### 🎯 実装タスク

#### 2A.1 Client Fuzzy Matching Engine
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant/fuzzy-matching.ts` (新規)
- [ ] **タスク**:
  - [ ] `fastest-levenshtein`の依存関係追加 (ブラウザ対応版)
  - [ ] `ClientFuzzyMatcher`クラス実装
  - [ ] Middle-out検索アルゴリズム (ブラウザ最適化)
  - [ ] 類似度計算とthreshold判定
  - [ ] リアルタイム処理最適化
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定  
- [ ] **優先度**: 最高

#### 2A.2 Client Diff Application Engine  
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant/diff-application.ts` (新規)
- [ ] **タスク**:
  - [ ] `EditorDiffApplicator`クラス実装
  - [ ] エディター(yText)への直接統合
  - [ ] インデント保持ロジック
  - [ ] アンドゥ・リドゥ対応
  - [ ] 行デルタ追跡
- [ ] **推定工数**: 5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 最高

#### 2A.3 Client Text Normalization
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant/text-normalization.ts` (新規)
  - [ ] `FuzzyMatcher`クラスの実装
  - [ ] 類似度計算ロジック (ブラウザ最適化)
  - [ ] Middle-out検索アルゴリズム
  - [ ] パフォーマンス最適化 (Web Workers対応準備)
- [ ] **推定工数**: 5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 2A.2 Diff適用エンジン (クライアント)
- [ ] **ファイル**: `apps/app/src/features/openai/client/services/search-replace/diff-application.ts` (新規)
- [ ] **タスク**:
  - [ ] エディタ直接統合 (CodeMirror/Monaco)
  - [ ] リアルタイムdiff適用
  - [ ] インデント保持機能
  - [ ] Undo/Redo対応
  - [ ] プレビューモード実装
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定  
- [ ] **優先度**: 高

#### 2A.3 Client Text Normalization
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant/text-normalization.ts` (新規)
- [ ] **タスク**:
  - [ ] `ClientTextNormalizer`クラス実装
  - [ ] スマートクォート・タイポグラフィ文字の正規化
  - [ ] Unicode正規化機能（NFC）
  - [ ] ブラウザ最適化処理
  - [ ] roo-code互換の正規化マップ実装
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 2A.4 Client Error Handling
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant/error-handling.ts` (新規)
- [ ] **タスク**:
  - [ ] `ClientErrorHandler`クラスの実装
  - [ ] リアルタイムエラー表示
  - [ ] 詳細なエラー情報とサジェスション
  - [ ] ユーザーフレンドリーなメッセージ
  - [ ] エラー復旧機能
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 2A.5 Client Main Processor
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant/processor.ts` (新規)
- [ ] **タスク**:
  - [ ] `ClientSearchReplaceProcessor`クラスの実装
  - [ ] 複数diff処理オーケストレーション
  - [ ] リアルタイム進捗フィードバック
  - [ ] 処理キャンセル機能
  - [ ] バッチ処理最適化
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 最高

#### 2A.6 Editor Integration
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant/editor-integration.ts` (新規)
- [ ] **タスク**:
  - [ ] useEditorAssistantフックの更新
  - [ ] クライアントサイド処理フローの統合
  - [ ] リアルタイム状態管理
  - [ ] プレビューモード実装
- [ ] **推定工数**: 5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 最高

**Phase 2A 総工数**: 27時間

---

## 📋 Phase 2B: サーバーサイド最適化 🎯 中優先度

### アーキテクチャ方針  
**専門化**: LLM通信、プロンプト生成、セキュリティに特化し、テキスト処理はクライアントに移管

### 🎯 実装タスク

#### 2B.1 LLM Response Processor (サーバー専門化)
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/llm-response-processor.ts` (新規)
- [ ] **タスク**:
  - [ ] OpenAI ストリーミングレスポンス専門処理
  - [ ] Search/Replace形式のパース
  - [ ] SSEストリーミング最適化
  - [ ] エラーハンドリング簡素化 (LLM通信エラーのみ)
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 2B.2 Prompt Generator (roo-code形式)
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/prompt-generator.ts` (新規)
- [ ] **タスク**:
  - [ ] roo-code SEARCH/REPLACE形式プロンプト生成
  - [ ] 複数diff指示の効率的記述
  - [ ] コンテキスト最適化
  - [ ] エスケープ処理とエラー防止
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 2B.3 Server Configuration
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/server-config.ts` (新規)
- [ ] **タスク**:
  - [ ] システム設定管理
  - [ ] 環境変数統合
  - [ ] セキュリティポリシー設定
  - [ ] レート制限設定
- [ ] **推定工数**: 2時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

#### 2B.4 API Route Updates
- [ ] **ファイル**: `apps/app/src/pages/api/v3/openai/editor-assistant/edit/index.ts`
- [ ] **タスク**:
  - [ ] 新しいレスポンス形式への対応
  - [ ] クライアント処理前提の軽量化
  - [ ] エラーハンドリング簡素化
  - [ ] パフォーマンス監視追加
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

**Phase 2B 総工数**: 12時間

---

## 📋 Phase 3: ハイブリッド処理フロー統合 🎯 中優先度

### 🎯 実装タスク

#### 3.1 Client-Server Integration
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant/integration.ts` (新規)
- [ ] **タスク**:
  - [ ] SSEストリーム受信処理
  - [ ] クライアントエンジンとの連携
  - [ ] エラー伝播・復旧機能
  - [ ] 処理状態の同期
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 3.2 useEditorAssistant Hook Update
- [ ] **ファイル**: `apps/app/src/client/services/editor-assistant.tsx`
- [ ] **タスク**:
  - [ ] 新しいクライアント処理フローの統合
  - [ ] 状態管理の最適化
  - [ ] エラーステート管理
  - [ ] ローディング状態の詳細化
- [ ] **推定工数**: 5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 3.3 Real-time Feedback System
- [ ] **ファイル**: `apps/app/src/client/components/AiAssistantSidebar/feedback-system.tsx` (新規)
- [ ] **タスク**:
  - [ ] リアルタイム処理状況表示
  - [ ] プログレスバー・ステップ表示
  - [ ] エラー詳細の表示UI
  - [ ] キャンセル・再試行ボタン
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定  
- [ ] **優先度**: 中

**Phase 3 総工数**: 15時間

---

## 📋 Phase 4: UI・UX改善 🎯 低優先度

### 🎯 実装タスク

#### 4.1 Preview Mode Implementation
- [ ] **ファイル**: `apps/app/src/client/components/AiAssistantSidebar/preview-mode.tsx` (新規)
- [ ] **タスク**:
  - [ ] 変更プレビューの表示
  - [ ] Diff表示機能
  - [ ] 適用前の確認UI
  - [ ] 部分適用選択機能
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

#### 4.2 Enhanced Error Display
- [ ] **ファイル**: `apps/app/src/client/components/AiAssistantSidebar/error-display.tsx` (新規)
- [ ] **タスク**:
  - [ ] 詳細エラー情報の視覚化
  - [ ] 修正提案の表示
  - [ ] エラー原因の説明
  - [ ] 復旧アクションボタン
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

#### 4.3 Settings Panel
- [ ] **ファイル**: `apps/app/src/client/components/AiAssistantSidebar/settings-panel.tsx` (新規)
- [ ] **タスク**:
  - [ ] クライアント設定UI
  - [ ] Fuzzy matching閾値調整
  - [ ] プレビューモード設定
  - [ ] デバッグモード切替
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

**Phase 4 総工数**: 13時間

---

## 📋 Phase 5: ドキュメント・テスト 🎯 低優先度

### 🎯 実装タスク

#### 5.1 Architecture Documentation
- [ ] **ファイル**: `apps/app/src/features/openai/docs/architecture/`
- [ ] **タスク**:
  - [ ] クライアント・サーバー分離図
  - [ ] データフロー図
  - [ ] エラーハンドリングフロー
  - [ ] API仕様書更新
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

#### 5.2 Unit Tests (Client)
- [ ] **ファイル**: `apps/app/test/client/services/editor-assistant/`
- [ ] **タスク**:
  - [ ] Fuzzy Matching Engine テスト
  - [ ] Diff Application Engine テスト
  - [ ] Text Normalization テスト
  - [ ] Error Handling テスト
  - [ ] ブラウザ環境テスト対応
- [ ] **推定工数**: 8時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 5.3 Integration Tests
- [ ] **ファイル**: `apps/app/test/integration/editor-assistant/`
- [ ] **タスク**:
  - [ ] エンドツーエンドフロー
  - [ ] パフォーマンステスト
  - [ ] エラーシナリオテスト
  - [ ] ブラウザ互換性テスト
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 5.4 User Documentation
- [ ] **ファイル**: `apps/app/docs/features/editor-assistant/`
- [ ] **タスク**:
  - [ ] 機能説明更新
  - [ ] トラブルシューティング
  - [ ] 設定ガイド
  - [ ] 開発者ガイド
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

**Phase 5 総工数**: 21時間
- [ ] **優先度**: 中

#### 2B.4 Audit & Logging (サーバー)
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/audit.ts` (新規)
- [ ] **タスク**:
  - [ ] 使用状況ログ
  - [ ] エラートラッキング
  - [ ] パフォーマンス監視
  - [ ] セキュリティ監査
- [ ] **推定工数**: 2時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

---

## 📋 Phase 3: サーバー・クライアント統合

### アーキテクチャ方針
**ハイブリッド処理**: サーバーからdiff配列を受信し、クライアントで適用する新しいフロー

### 🎯 実装タスク

#### 3.1 edit/index.ts統合 (サーバー)
- [ ] **ファイル**: `apps/app/src/features/openai/server/routes/edit/index.ts`
- [ ] **タスク**:
  - [ ] roo-code形式プロンプト統合
  - [ ] 新しいLLM Response Processor連携
  - [ ] diff配列レスポンス最適化
  - [ ] エラーハンドリング統合
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 3.2 useEditorAssistant統合 (クライアント)
- [ ] **ファイル**: `apps/app/src/features/openai/client/services/editor-assistant.tsx`
- [ ] **タスク**:
  - [ ] 新しいクライアントプロセッサ統合
  - [ ] SSEストリーミング対応
  - [ ] リアルタイム処理フロー
  - [ ] エラーハンドリング強化
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

#### 3.3 型定義共有化
- [ ] **ファイル**: `apps/app/src/features/openai/interfaces/editor-assistant/shared-types.ts` (新規)
- [ ] **タスク**:
  - [ ] クライアント・サーバー共通型定義
  - [ ] API仕様の統一
  - [ ] バリデーションスキーマ共有
  - [ ] TypeScript strict mode対応
- [ ] **推定工数**: 2時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 3.4 パッケージ依存関係
- [ ] **ファイル**: `apps/app/package.json`
- [ ] **タスク**:
  - [ ] `fastest-levenshtein`パッケージの追加 (クライアント・サーバー両方)
  - [ ] 型定義ファイルの追加
  - [ ] ビルド設定の最適化
- [ ] **推定工数**: 0.5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 高

---

## 📋 Phase 4: UI・UX改善

### アーキテクチャ方針
**リアルタイムフィードバック**: クライアントサイド処理の利点を活かしたUX向上

### 🎯 実装タスク

#### 4.1 AiAssistantSidebar更新
- [ ] **ファイル**: `apps/app/src/features/openai/client/components/AiAssistant/AiAssistantSidebar/AiAssistantSidebar.tsx`
- [ ] **タスク**:
  - [ ] リアルタイム処理状況表示
  - [ ] 詳細なエラー表示UI
  - [ ] 部分適用結果のプレビュー
  - [ ] キャンセル・再試行機能
- [ ] **推定工数**: 5時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 4.2 Editor統合強化
- [ ] **ファイル**: `apps/app/src/features/openai/client/components/Editor/EditorAssistantIntegration.tsx` (新規)
- [ ] **タスク**:
  - [ ] リアルタイムdiffプレビュー
  - [ ] インライン適用確認
  - [ ] Undo/Redo対応
  - [ ] キーボードショートカット
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

#### 4.3 パフォーマンス監視UI
- [ ] **ファイル**: `apps/app/src/features/openai/client/components/AiAssistant/PerformanceMonitor.tsx` (新規)
- [ ] **タスク**:
  - [ ] 処理時間表示
  - [ ] メモリ使用量監視
  - [ ] 成功・失敗率表示
  - [ ] デバッグ情報表示
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

---

## 📋 Phase 5: プロンプト・ドキュメント更新

### 🎯 実装タスク

#### 5.1 プロンプト更新
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/prompt-generator.ts`
- [ ] **タスク**:
  - [ ] roo-code形式の指示統合
  - [ ] Search/Replaceブロックの説明
  - [ ] エラー対処方法の記載
  - [ ] 多言語対応の確認
- [ ] **推定工数**: 3時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 中

#### 5.2 ドキュメント更新
- [ ] **ファイル**: `apps/app/src/features/openai/docs/`
- [ ] **タスク**:
  - [ ] アーキテクチャ図の更新
  - [ ] API仕様書の更新
  - [ ] クライアント・サーバー責務分離の説明
  - [ ] パフォーマンス最適化ガイド
  - [ ] トラブルシューティング
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

---

## 📋 Phase 6: テスト・検証

### 🎯 実装タスク

#### 6.1 統合テスト
- [ ] **ファイル**: `apps/app/test/integration/editor-assistant/` (新規)
- [ ] **タスク**:
  - [ ] サーバー・クライアント連携テスト
  - [ ] リアルタイム処理フローテスト
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
  - [ ] パフォーマンス回帰テスト
- [ ] **推定工数**: 6時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

#### 6.3 負荷・パフォーマンステスト
- [ ] **ファイル**: `apps/app/test/performance/editor-assistant/` (新規)
- [ ] **タスク**:
  - [ ] 大きなファイルでのクライアント処理テスト
  - [ ] 複数diff処理のベンチマーク
  - [ ] メモリ使用量の測定
  - [ ] ネットワーク効率の検証
- [ ] **推定工数**: 4時間
- [ ] **担当者**: 未定
- [ ] **優先度**: 低

---

## 📊 進捗管理 - 更新版

### 全体進捗
- **総タスク数**: 22タスク  
- **完了**: 3タスク (14%) - Phase 1完了
- **進行中**: 0タスク (0%)
- **未着手**: 19タスク (86%)

### Phase別進捗  
| Phase | タスク数 | 完了 | 進捗率 | 推定総工数 | 優先度 |
|-------|----------|------|--------|------------|---------|
| **Phase 1** ✅ | 3 | 3 | 100% | 4時間 | 完了 |
| **Phase 2A** (クライアント) 🎯 | 6 | 0 | 0% | 27時間 | **最高** |
| **Phase 2B** (サーバー) | 4 | 0 | 0% | 12時間 | 中 |
| **Phase 3** (統合) | 3 | 0 | 0% | 15時間 | 中 |
| **Phase 4** (UI/UX) | 3 | 0 | 0% | 13時間 | 低 |
| **Phase 5** (ドキュメント・テスト) | 4 | 0 | 0% | 21時間 | 低 |
| **合計** | **22** | **3** | **14%** | **92時間** | - |

### 次の優先アクション 🎯

#### 最高優先 (Phase 2A)
1. **Client Fuzzy Matching Engine** (4時間)
2. **Client Diff Application Engine** (5時間) 
3. **Client Main Processor** (6時間)
4. **Editor Integration** (5時間)

これらの完了により、基本的なクライアントサイド処理が実現されます。

### アーキテクチャ移行状況

#### ✅ 完了
- スキーマ・型定義の Search/Replace 対応
- サーバーサイドプロトタイプ実装（参考用）

#### 🔄 進行中  
- **アーキテクチャ設計変更**: サーバー → クライアント処理移行
- **実装方針**: roo-code方式の完全採用

#### 📋 未着手
- クライアントサイドエンジンの実装
- サーバー責務の専門化
- ハイブリッド統合フロー

### 推定完了スケジュール  
- **Phase 2A** (最優先): 約3.5週間
- **Phase 2B + 3** (統合): 約3.5週間  
- **Phase 4 + 5** (仕上げ): 約4週間
- **総期間**: 約**11週間** (85時間実装 + 文書作成・テスト)

### 技術的負債対応
- **ESLintエラー**: サーバーサイドプロトタイプファイルに残存 (移行後削除予定)
- **依存関係**: `fastest-levenshtein`のクライアントサイド対応確認が必要
- **テスト戦略**: ブラウザ環境での単体テスト環境構築

---

## 🎯 実装開始時の推奨順序

### 段階1: 基盤構築
1. Client Fuzzy Matching Engine
2. Client Text Normalization  
3. Client Error Handling

### 段階2: 処理実装
4. Client Diff Application Engine
5. Client Main Processor
6. Editor Integration

### 段階3: 統合・最適化
7. Client-Server Integration
8. useEditorAssistant Hook Update
9. Real-time Feedback System

この順序により、段階的に機能を積み上げて検証しながら開発を進められます。
| Phase 2B (サーバー) | 4 | 0 | 0% | 11時間 |
| Phase 3 (統合) | 4 | 0 | 0% | 12.5時間 |
| Phase 4 (UI/UX) | 3 | 0 | 0% | 14時間 |
| Phase 5 (ドキュメント) | 2 | 0 | 0% | 7時間 |
| Phase 6 (テスト) | 3 | 0 | 0% | 18時間 |
| **合計** | **26** | **0** | **0%** | **96.5時間** |

### 優先度別
- **高優先度**: 12タスク (46%)
- **中優先度**: 8タスク (31%)
- **低優先度**: 6タスク (23%)

### 新アーキテクチャのメリット
- **パフォーマンス**: ローカル処理でレスポンス時間50%短縮予想
- **プライバシー**: ユーザーコンテンツのサーバー送信不要
- **リアルタイム**: 即座のフィードバックとプレビュー
- **ネットワーク効率**: diff配列のみ転送でトラフィック削減
- **オフライン対応**: 処理済みdiffの再適用可能

### 推定スケジュール
- **開発期間**: 約3-4週間 (1人稼働)
- **クリティカルパス**: Phase 1 → Phase 2A → Phase 3
- **並行可能**: Phase 2B、Phase 4以降は部分的に並行実装可能

---

## 🎯 次のアクション

### 即座に着手可能 (クライアント優先)
1. **Phase 2A.1**: Fuzzy Matching Engine (クライアント)
2. **Phase 2A.3**: Text Normalization (クライアント)
3. **Phase 1.1**: LLM Response Schemas更新

### 依存関係あり
- Phase 2A → Phase 3 → Phase 4
- Phase 2B は Phase 2A と並行可能
- Phase 1 完了後すべて着手可能

### リスクと対策
- **技術リスク**: クライアント処理パフォーマンス
  - **対策**: Web Workers、段階的最適化
- **互換性リスク**: 既存機能への影響
  - **対策**: フィーチャーフラグでの段階的移行
- **アーキテクチャリスク**: サーバー・クライアント連携
  - **対策**: 共通型定義、詳細な統合テスト

---
**ファイル**: `implementation-tasks.md`  
**作成日**: 2025-06-17  
**更新日**: 2025-06-17  
**ステータス**: 計画段階
