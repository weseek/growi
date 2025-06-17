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

## 📋 Phase 2A: Search-Replace機能実装 ❌ **重大な未完了判明**

### ⚠️ **実装状況の真実**
**2025-06-17発見**: Phase 2Aの「完了」は表面的なファイル存在のみで、**核心機能は全く実装されていない**

### 🔍 **現状分析**
#### ✅ 存在する部分
- **高品質なクライアントサイドファイル**: fuzzy-matching.ts、text-normalization.ts、error-handling.ts等
- **完全なLLMスキーマ**: JSON形式`search`/`replace`フィールド完備
- **SSEストリーミング**: リアルタイム配信完成

#### ❌ **完全に未実装な部分**
- **search処理**: `detectedDiff.data.diff.search`が完全に無視されている
- **行番号検索**: `startLine`パラメータ未活用
- **正確な置換**: 単純な末尾追加のみの劣悪な実装
- **クライアントエンジン統合**: 高品質なファイルが全く統合されていない

### 📊 **実際の完了度**
```
- ファイル存在度: ✅ 90% (見た目完了)
- 機能実装度: ❌ 15% (実質未実装)
- 統合度: ❌ 5% (統合なし)
```

### 🎯 **Phase 2A 完遂計画** 
**詳細**: `phase-2a-completion-plan.md`および`phase-2a-task-checklist.md`参照

#### 必要な核心実装 (8-12時間)
1. **スキーマ強化**: `startLine`必須化
2. **search-replace実装**: 既存の劣悪な末尾追加を真の検索・置換に変更
3. **Fuzzy Matching統合**: 既存ファイルの統合
4. **エラーハンドリング**: 検索失敗時の適切な処理
5. **クライアントエンジン統合**: 高品質ファイル群の統合

#### 現在の劣悪な実装 (要完全修正)
```typescript
// 現在: searchを完全に無視し、replaceのみ末尾追加
if (detectedDiff.data.diff) {
  if (isTextSelected) {
    insertTextAtLine(yText, lineRef.current, detectedDiff.data.diff.replace);
  } else {
    appendTextLastLine(yText, detectedDiff.data.diff.replace); // ← 劣悪
  }
}
```

#### 実装すべき正しい処理
```typescript
// 正しい実装: searchで検索してreplaceで置換
const { search, replace, startLine } = detectedDiff.data.diff;
const success = performSearchReplace(yText, search, replace, startLine);
if (!success) {
  // フォールバック処理
}
```

**Phase 2A 実工数**: ❌ 8-12時間 (未完了) / ✅ 27時間 (誤った記載)

---

## 📋 Phase 2B: サーバーサイド最適化 ⏳ **Phase 2A完了後に実施**

### アーキテクチャ方針  
**専門化**: LLM通信、プロンプト生成、セキュリティに特化し、テキスト処理はクライアントに移管

### ⚠️ **依存関係**: Phase 2A完了が前提

### 🎯 実装タスク

#### 2B.1 LLM Response Processor (サーバー専門化)
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/llm-response-processor.ts` (新規)
- [ ] **タスク**:
  - [ ] OpenAI ストリーミングレスポンス専門処理
  - [ ] Search/Replace形式のパース
  - [ ] SSEストリーミング最適化
  - [ ] エラーハンドリング簡素化 (LLM通信エラーのみ)
- [ ] **推定工数**: 4時間
- [ ] **優先度**: 中

#### 2B.2 Prompt Generator (roo-code形式)
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/prompt-generator.ts` (新規)
- [ ] **タスク**:
  - [ ] roo-code SEARCH/REPLACE形式プロンプト生成
  - [ ] 複数diff指示の効率的記述
  - [ ] コンテキスト最適化
  - [ ] エスケープ処理とエラー防止
- [ ] **推定工数**: 3時間
- [ ] **優先度**: 中

#### 2B.3 Server Configuration
- [ ] **ファイル**: `apps/app/src/features/openai/server/services/editor-assistant/server-config.ts` (新規)
- [ ] **タスク**:
  - [ ] システム設定管理
  - [ ] 環境変数統合
  - [ ] セキュリティポリシー設定
  - [ ] レート制限設定
- [ ] **推定工数**: 2時間
- [ ] **優先度**: 低

#### 2B.4 API Route Updates
- [ ] **ファイル**: `apps/app/src/pages/api/v3/openai/editor-assistant/edit/index.ts`
- [ ] **タスク**:
  - [ ] 新しいレスポンス形式への対応
  - [ ] クライアント処理前提の軽量化
  - [ ] エラーハンドリング簡素化
  - [ ] パフォーマンス監視追加
- [ ] **推定工数**: 3時間
- [ ] **優先度**: 中

**Phase 2B 総工数**: 12時間

---

## 📋 Phase 3: ハイブリッド処理フロー統合 ⏳ **Phase 2A完了後に実施**

### ⚠️ **依存関係**: Phase 2A完了が前提

### 🎯 実装タスク

#### 3.1 Client-Server Integration
- [ ] **ファイル**: `apps/app/src/features/openai/client/services/editor-assistant/integration.ts` (新規)
- [ ] **タスク**:
  - [ ] SSEストリーム受信処理
  - [ ] クライアントエンジンとの連携
  - [ ] エラー伝播・復旧機能
  - [ ] 処理状態の同期
- [ ] **推定工数**: 4時間
- [ ] **優先度**: 高

#### 3.2 useEditorAssistant Hook Update
- [ ] **ファイル**: `apps/app/src/features/openai/client/services/editor-assistant/use-editor-assistant.tsx`
- [ ] **タスク**:
  - [ ] 新しいクライアント処理フローの統合
  - [ ] 状態管理の最適化
  - [ ] エラーステート管理
  - [ ] ローディング状態の詳細化
- [ ] **推定工数**: 5時間
- [ ] **優先度**: 高

#### 3.3 Real-time Feedback System
- [ ] **ファイル**: `apps/app/src/client/components/AiAssistantSidebar/feedback-system.tsx` (新規)
- [ ] **タスク**:
  - [ ] リアルタイム処理状況表示
  - [ ] プログレスバー・ステップ表示
  - [ ] エラー詳細の表示UI
  - [ ] キャンセル・再試行ボタン
- [ ] **推定工数**: 6時間
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

---

## 📊 **修正されたプロジェクトサマリー**

### 実装進捗（実態反映版）
| Phase | タスク数 | 完了数 | 進捗率 | 残工数 |
|-------|----------|--------|---------|---------|
| **Phase 1 (スキーマ)** | ✅ | ✅ | **100%** | 0時間 |
| **Phase 2A (コア機能)** | 7 | 0 | **0%** | **8-12時間** |
| Phase 2B (サーバー) | 4 | 0 | 0% | 12時間 |
| Phase 3 (統合) | 3 | 0 | 0% | 15時間 |
| Phase 4 (UI/UX) | 3 | 0 | 0% | 13時間 |
| Phase 5 (ドキュメント) | 4 | 0 | 0% | 21時間 |

### 🎯 **即座に実行すべきアクション**

#### **最高優先度: Phase 2A完遂** (8-12時間)
**詳細タスク**: [`phase-2a-completion-plan.md`](./phase-2a-completion-plan.md) および [`phase-2a-task-checklist.md`](./phase-2a-task-checklist.md) 参照

1. **スキーマ強化**: `startLine`必須化（1時間）
2. **search-replace実装**: 現在の劣悪な末尾追加を真の検索・置換に変更（4-5時間）
3. **Fuzzy Matching統合**: 既存ファイルの統合（2時間）
4. **エラーハンドリング強化**: 検索失敗時の適切な処理（1時間）
5. **クライアントエンジン統合**: 高品質ファイル群の統合（2時間）

#### **実装スケジュール**
- **フェーズ2A実装**: 1日（8-12時間）
- **テスト・デバッグ**: 0.5日（4時間）
- **合計**: 1.5日でroo-code level機能完成

### 新アーキテクチャのメリット（実装後）
- **パフォーマンス**: ローカル処理でレスポンス時間50%短縮予想
- **プライバシー**: ユーザーコンテンツのサーバー送信不要
- **リアルタイム**: 即座のフィードバックとプレビュー
- **ネットワーク効率**: diff配列のみ転送でトラフィック削減
- **正確性**: ✅ 真のsearch-replace機能でroo-code水準の精度

### ⚠️ **リスクと対策**
- **技術リスク**: クライアント処理パフォーマンス
  - **対策**: 段階的最適化、必要時Web Workers検討
- **互換性リスク**: 既存機能への影響
  - **対策**: フォールバック機能による段階的移行
- **実装リスク**: 複雑な統合
  - **対策**: 詳細タスクリストと段階的テスト

### 🎯 **推奨実装順序**

#### **段階1: 基盤構築（Phase 2A前半）**
1. **スキーマ強化**: `startLine`必須化
2. **search-replace-engine.ts作成**: 核心検索・置換ロジック
3. **useEditorAssistant更新**: 既存の劣悪な処理を修正

#### **段階2: 統合強化（Phase 2A後半）**
4. **Fuzzy Matching統合**: 既存エンジンの活用
5. **エラーハンドリング**: 検索失敗時の適切な処理
6. **クライアントエンジン統合**: 高品質ファイルの統合

#### **段階3: 検証・最適化**
7. **手動テスト**: 基本機能動作確認
8. **パフォーマンステスト**: 大きなファイルでの動作確認
9. **エラーケーステスト**: フォールバック機能確認

この順序により、最短期間で実用的なsearch-replace機能を実現できます。

---

**ファイル**: `implementation-tasks.md`  
**作成日**: 2025-06-17  
**更新日**: 2025-06-17 (Phase 2A実態反映)  
**ステータス**: Phase 2A核心機能未実装判明、8-12時間で完遂可能  
**次のアクション**: [`phase-2a-completion-plan.md`](./phase-2a-completion-plan.md) の実行
