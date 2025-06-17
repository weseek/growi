# GROWI エディターアシスタント改修計画 - クライアント・サーバー分離アーキテクチャ

このディレクトリには、現在のGROWIエディターアシスタントをroo-codeの方式に倣って**クライアント・サーバー分離アーキテクチャ**で再実装するための包括的な改修計画が含まれています。

## 📁 ファイル構成

### 📋 計画ドキュメント

#### [`editor-assistant-refactoring-plan.md`](./editor-assistant-refactoring-plan.md)
**メイン計画書** - クライアント・サーバー分離による改修プロジェクト全体の概要
- 📊 現状分析（全サーバーサイド処理）と課題の特定
- 🎯 新アーキテクチャ目標とroo-code方式の適用
- 🔄 段階別実装計画（Phase 2A/2B分離）
- 📈 期待効果（パフォーマンス50%向上、ネットワーク80%削減）
- ✅ 進捗状況（Phase 1完了、Phase 2A実装中）

#### [`technical-implementation-details.md`](./technical-implementation-details.md)
**技術実装詳細** - ハイブリッドアーキテクチャと具体的な実装方法
- 🏗️ クライアント・サーバー責務分離のフロー図
- 📦 新ファイル構成（client/server分離）
- 🔍 核心技術の配置（ClientFuzzyMatcher、EditorDiffApplicator等）
- 🎛️ ハイブリッド設定管理
- 🧪 分散テスト戦略
- 📈 ネットワーク・メモリ最適化

#### [`implementation-tasks.md`](./implementation-tasks.md)
**実装タスクリスト** - クライアント・サーバー分離に基づく具体的なタスク
- ✅ Phase 1: スキーマ更新（完了済み）
- 🎯 Phase 2A: クライアントサイドエンジン実装（最優先・27時間）
- 🔄 Phase 2B: サーバーサイド最適化（12時間）
- 🔗 Phase 3: ハイブリッド統合（15時間）
- 📊 総工数92時間、22タスクの詳細管理

#### [`roo-code-investigation-supplement.md`](./roo-code-investigation-supplement.md)
**roo-code調査レポート** - VSCode拡張アーキテクチャの詳細分析
- 🧪 クライアントサイド処理パターンの調査
- 🛡️ ブラウザ環境でのエラーハンドリング
- 🎛️ リアルタイム設定管理とパフォーマンス
- 📝 文字正規化のブラウザ実装
- 📈 アーキテクチャ変更への反映（+11.5時間）

## 🚀 改修概要 - 新アーキテクチャ

### 現在の課題
- **全サーバーサイド処理**: パフォーマンス・プライバシー・拡張性の制約
- **精度不足**: 単純な`replace`のみで誤った箇所を変更するリスク
- **ネットワーク負荷**: 全コンテンツのサーバー送信
- **リアルタイム性欠如**: 処理中のフィードバック不足

### 改修後の実現機能（ハイブリッドアーキテクチャ）

#### 🖥️ **クライアントサイド処理**
- **Search/Replace Engine**: ブラウザ内での高速Fuzzy Matching
- **リアルタイム適用**: エディターへの即座diff適用
- **プレビュー機能**: 変更前確認とキャンセル機能
- **プライバシー強化**: ユーザーコンテンツの非送信
- **複数diff処理**: 一つのリクエストで複数箇所の変更
- **詳細エラー報告**: 失敗原因と解決策の具体的な提示

## 📊 改修スコープ

### 影響範囲
```
apps/app/src/features/openai/
├── interfaces/editor-assistant/     # スキーマ更新
├── server/routes/edit/             # プロンプト・処理統合  
├── server/services/editor-assistant/ # 新処理エンジン
└── client/services/                # クライアント対応
```

#### 🔧 **サーバーサイド専門化**
- **LLM通信管理**: OpenAI APIとの効率的ストリーミング
- **プロンプト最適化**: roo-code形式の指示生成
- **セキュリティ**: 認証・認可・レート制限
- **ネットワーク効率**: diff配列のみの転送

### 新規実装コンポーネント（分散配置）

#### クライアントサイド
- **ClientFuzzyMatcher**: ブラウザ内類似度計算
- **EditorDiffApplicator**: エディター直接統合
- **ClientSearchReplaceProcessor**: ローカル処理エンジン  
- **ClientErrorHandler**: リアルタイムエラー表示

#### サーバーサイド
- **LlmResponseProcessor**: OpenAI専門パーサー
- **PromptGenerator**: roo-code形式生成
- **ServerConfig**: システム設定管理

## 🎯 実装優先順位 - 更新版

### 🔴 **最高優先度** (Phase 2A - 27時間)
1. **Client Fuzzy Matching Engine** - ブラウザ内高速検索  
2. **Client Diff Application Engine** - エディター直接統合
3. **Client Main Processor** - ローカル処理統合
4. **Editor Integration** - useEditorAssistantフック更新

### 🟡 **中優先度** (Phase 2B, 3 - 27時間)
5. **Server Optimization** - LLM専門化・軽量化
6. **Hybrid Integration** - クライアント・サーバー連携
7. **Real-time Feedback** - 処理状況の即座表示

### 🟢 **低優先度** (Phase 4, 5 - 34時間)
8. **UI Enhancement** - プレビュー・設定画面
9. **Documentation** - アーキテクチャ図・API仕様
10. **Testing** - 単体・統合・E2Eテスト

## 📈 期待効果 - 新アーキテクチャ

| 指標 | 現在 | 改修後 | 改善率 |
|------|------|--------|--------|
| **編集精度** | 60-70% | 90-95% | +30-35% |
| **レスポンス時間** | 2-3秒 | 0.5-1秒 | **50-70%** |
| **ネットワーク負荷** | 全コンテンツ | diff配列のみ | **80%** |
| **サーバー負荷** | 高（全処理） | 低（LLMのみ） | **60%** |
| **プライバシー** | 全送信 | 最小限 | **大幅改善** |

## 📊 進捗状況

### ✅ **完了** 
- **Phase 1**: スキーマ・インターフェース更新 (4時間)
- **Phase 2A**: クライアントサイドEngine実装 (23時間) 🎉 **完全完了**

### 🎯 **Phase 2A 完了詳細**
**5つのコアコンポーネント、ESLintエラー0件で完成:**
1. **ClientFuzzyMatcher**: ブラウザ最適化された類似度計算、middle-out検索
2. **ClientTextNormalizer**: Unicode正規化、スマートクォート処理、高速正規化
3. **ClientErrorHandler**: 詳細エラー分類、ユーザーフレンドリーメッセージ
4. **ClientDiffApplicationEngine**: エディター直接統合、undo/redo対応
5. **ClientSearchReplaceProcessor**: リアルタイム進捗、バッチ処理orchestration

### 🧹 **アーキテクチャ整理完了**
Phase 2A完了により、サーバーサイドプロトタイプの整理を実施：
- **❌ 削除**: 6個のプロトタイプファイル（クライアント版で代替）
- **✅ 保持**: `llm-response-stream-processor.ts` (Phase 2B用)
- **📂 結果**: クライアント・サーバー責務分離の明確化

### 🚀 **次のステップ選択肢**

#### Option 1: 既存フック統合 (推奨)
- **目的**: `useEditorAssistant`フックにクライアントエンジンを統合
- **工数**: 6-8時間
- **メリット**: 即座のテスト・フィードバック・価値実現

#### Option 2: Phase 2B サーバー最適化  
- **工数**: 12時間
- **内容**: LLM通信専門化、roo-codeプロンプト

#### Option 3: Phase 3 ハイブリッド統合
- **工数**: 15時間  
- **内容**: 新しいクライアント・サーバー連携フロー

## 🔗 参考資料

- [roo-code GitHub Repository](https://github.com/RooCodeInc/Roo-Code)
- [roo-code apply_diff implementation](https://github.com/RooCodeInc/Roo-Code/blob/main/src/core/tools/applyDiffTool.ts)
- [roo-code multi-search-replace strategy](https://github.com/RooCodeInc/Roo-Code/blob/main/src/core/diff/strategies/multi-search-replace.ts)
- [`roo-prompts.md`](../roo-prompts.md) - roo-codeのプロンプト仕様

## 📝 使用方法

### 計画書の読み順（新アーキテクチャ対応）
1. **まず**: [`editor-assistant-refactoring-plan.md`](./editor-assistant-refactoring-plan.md) でクライアント・サーバー分離の全体概要を把握
2. **次に**: [`implementation-tasks.md`](./implementation-tasks.md) でPhase 2A（クライアント実装）の具体的なタスクを確認
3. **詳細**: [`technical-implementation-details.md`](./technical-implementation-details.md) でハイブリッドアーキテクチャの技術詳細を理解
4. **背景**: [`roo-code-investigation-supplement.md`](./roo-code-investigation-supplement.md) でアーキテクチャ変更の根拠を確認

### 実装開始時（更新版）
1. **Phase 2A**から着手: クライアントサイドエンジンの実装を最優先
2. **段階的検証**: Fuzzy Matching → Diff Application → 統合の順序で進行
3. **並行開発**: Phase 2Aと2Bを部分的に並行実装可能
4. **進捗管理**: [`implementation-tasks.md`](./implementation-tasks.md) のチェックリストで管理

## ⚠️ 重要な注意事項

### アーキテクチャ変更による影響
- **既存プロトタイプ**: サーバーサイドファイルは参考用（後で削除予定）
- **依存関係**: `fastest-levenshtein`のブラウザ対応要確認
- **テスト環境**: ブラウザ環境での単体テスト構築が必要
- **パフォーマンス**: クライアント処理のメモリ使用量監視が重要

### 開発時の注意点
- **段階的移行**: 全機能を一度に移行せず、段階的な移行を推奨
- **後方互換性**: 既存機能との共存を考慮した実装
- **エラーハンドリング**: クライアントサイドエラーの適切な処理
- **セキュリティ**: クライアント処理でもセキュリティ配慮が必要

---

**最終更新**: クライアント・サーバー分離アーキテクチャへの設計変更完了
**次のマイルストーン**: Phase 2A クライアントサイドエンジン実装開始

## ⚠️ 重要な注意事項

### 互換性
- 既存のエディターアシスタント機能との互換性を維持
- 段階的な移行でリスクを最小化
- フィーチャーフラグでの制御推奨

### 品質保証
- 各フェーズで十分なテストを実施
- パフォーマンス劣化の監視
- エラーハンドリングの検証

---

**プロジェクト**: GROWI エディターアシスタント改修  
**作成日**: 2025-06-17  
**最終更新**: 2025-06-17 (roo-code調査結果反映)  
**ステータス**: 計画段階  
**総推定工数**: 77時間 (約2-3週間)
**総タスク数**: 20個
