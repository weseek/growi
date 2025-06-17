# GROWI エディターアシスタント改修計画 - Plan Directory

このディレクトリには、現在のGROWIエディターアシスタントをroo-codeの方式に倣って再実装するための包括的な改修計画が含まれています。

## 📁 ファイル構成

### 📋 計画ドキュメント

#### [`editor-assistant-refactoring-plan.md`](./editor-assistant-refactoring-plan.md)
**メイン計画書** - 改修プロジェクト全体の概要
- 📊 現状分析と課題の特定
- 🎯 改修目標とroo-code方式の採用理由
- 📝 5段階の実装計画
- 📈 期待効果と品質指標
- 🧪 検証計画

#### [`technical-implementation-details.md`](./technical-implementation-details.md)
**技術実装詳細** - アーキテクチャと具体的な実装方法
- 🏗️ アーキテクチャ変更のフロー図
- 📦 ファイル構成と新規作成対象
- 🔍 核心技術（MultiSearchReplaceProcessor、FuzzyMatcher等）
- 🎛️ 設定とカスタマイズ方法
- 🧪 テスト戦略
- 📈 パフォーマンス考慮事項

#### [`implementation-tasks.md`](./implementation-tasks.md)
**実装タスクリスト** - 具体的なタスクと進捗管理
- ✅ Phase別の詳細タスク分解
- ⏱️ 推定工数と優先度
- 👥 担当者アサイン欄
- 📊 進捗管理表
- 🎯 次のアクション項目

#### [`roo-code-investigation-supplement.md`](./roo-code-investigation-supplement.md)
**roo-code調査レポート** - 詳細調査結果と計画への反映
- 🧪 テスト戦略の分析（1186行のテストファイル調査）
- 🛡️ エラーハンドリングパターン
- 🎛️ 設定管理とカスタマイズ方法
- 📝 文字正規化とパフォーマンス最適化
- 📈 計画への反映事項と工数調整

## 🚀 改修概要

### 現在の課題
- **精度不足**: 単純な`replace`のみで誤った箇所を変更するリスク
- **機能限界**: 複数変更の一括処理が困難
- **エラー情報不足**: 失敗時の原因特定が困難

### 改修後の実現機能
- **Search/Replace方式**: 正確な検索条件による安全な置換
- **Fuzzy Matching**: Levenshtein距離による柔軟な類似度判定
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

### 新規実装コンポーネント
- **MultiSearchReplaceProcessor**: メイン処理エンジン
- **FuzzyMatcher**: 類似度計算・検索機能
- **DiffApplicationEngine**: 差分適用ロジック
- **ErrorHandler**: 強化されたエラーハンドリング

## 🎯 実装優先順位

### 🔴 高優先度 (Phase 1-2)
1. スキーマ・インターフェース更新
2. Search/Replace処理エンジン実装
3. サーバーサイド統合

### 🟡 中優先度 (Phase 3-4)  
4. クライアントサイド対応
5. 統合テスト
6. プロンプト更新

### 🟢 低優先度 (Phase 5-6)
7. UI改善・最適化
8. E2Eテスト
9. ドキュメント整備

## 📈 期待効果

| 指標 | 現在 | 改修後 | 改善率 |
|------|------|--------|--------|
| **編集精度** | 60-70% | 90-95% | +30-35% |
| **複雑変更対応** | 困難 | 対応可能 | - |
| **エラー情報** | 限定的 | 詳細 | +200% |

## 🔗 参考資料

- [roo-code GitHub Repository](https://github.com/RooCodeInc/Roo-Code)
- [roo-code apply_diff implementation](https://github.com/RooCodeInc/Roo-Code/blob/main/src/core/tools/applyDiffTool.ts)
- [roo-code multi-search-replace strategy](https://github.com/RooCodeInc/Roo-Code/blob/main/src/core/diff/strategies/multi-search-replace.ts)
- [`roo-prompts.md`](../roo-prompts.md) - roo-codeのプロンプト仕様

## 📝 使用方法

### 計画書の読み順
1. **まず**: [`editor-assistant-refactoring-plan.md`](./editor-assistant-refactoring-plan.md) で全体概要を把握
2. **次に**: [`technical-implementation-details.md`](./technical-implementation-details.md) で技術詳細を理解
3. **最後に**: [`implementation-tasks.md`](./implementation-tasks.md) で具体的なタスクを確認

### 実装開始時
1. [`implementation-tasks.md`](./implementation-tasks.md) のPhase 1から着手
2. 各フェーズ完了後、進捗を更新
3. 技術的な詳細は [`technical-implementation-details.md`](./technical-implementation-details.md) を参照

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
