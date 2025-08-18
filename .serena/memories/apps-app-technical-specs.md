# apps/app 技術仕様・開発ガイド

## ファイル命名規則
- Next.js ページ: `*.page.tsx`
- React コンポーネント: `ComponentName.tsx`
- スタイル: `ComponentName.module.scss`
- テスト: `*.spec.ts`, `*.test.ts`, `*.integ.ts`
- 型定義: `*.d.ts`

## 重要な設定ファイル
- `next.config.js` - Next.js 設定
- `tsconfig.json` - TypeScript 設定（複数レイヤー）
- `package.json` - 依存関係とスクリプト
- `turbo.json` - Turborepo 設定

## API 構造
### API v3 (`server/routes/apiv3/`)
- RESTful API エンドポイント
- Express.js ルーター使用
- バリデーション・認証ミドルウェア
- OpenAPI 仕様準拠

### フィーチャー API
各フィーチャーが独自の API ルートを持つ場合あり
例: `features/openai/server/routes/`

## 状態管理パターン
### Jotai (推奨・新)
- `states/` ディレクトリ
- アトミックな状態管理
- ファイル別に関心事を分離

### SWR (データフェッチング)
- サーバーサイドデータの管理
- キャッシュとリバリデーション
- `stores-universal/context.tsx` でコンテキスト提供

## スタイリング指針
### SCSS 構造
- `styles/` ディレクトリに全体スタイル
- コンポーネント別に `.module.scss`
- Atomic Design っぽい構造（atoms, molecules, organisms）

### CSS Modules
- スコープ化されたクラス名
- TypeScript での型安全性

## データベース・モデル
### Mongoose モデル (`server/models/`)
- MongoDB スキーマ定義
- バリデーション・ミドルウェア
- インデックス定義

### シリアライザー
- `serializers/` でレスポンス形式を統一
- クライアント向けデータ変換

## セキュリティ機能
### 認証・認可
- 複数の認証プロバイダー対応
- ページ・API レベルでの権限制御
- アクセストークン・API キー

### XSS・CSRF 対策
- `services/general-xss-filter/`
- サニタイゼーション機能

## 国際化 (i18n)
- next-i18next 使用
- 多言語リソース管理
- サーバーサイド・クライアントサイド両対応

## テスト戦略
### テストタイプ
- `.spec.ts` - ユニットテスト
- `.integ.ts` - 統合テスト
- Playwright - E2E テスト

### テスト実行
- Jest (ユニット・統合)
- Vitest (一部)
- GitHub Actions CI

## プラグインシステム
### GROWI プラグイン
- `features/growi-plugin/`
- 動的プラグイン読み込み
- テーマ・テンプレート拡張

## パフォーマンス最適化
### レンダリング
- サーバーサイドレンダリング (SSR)
- 静的生成 (SSG) 一部対応
- コード分割

### 検索機能
- Elasticsearch 統合
- 全文検索インデックス
- 検索結果キャッシュ

## 監視・ロギング
### OpenTelemetry
- `features/opentelemetry/`
- メトリクス・トレース収集
- カスタムメトリクス

### ログ
- Bunyan ロガー使用
- 構造化ログ出力

## 開発時の注意点
1. 新機能は features/ に実装
2. TypeScript strict モード準拠
3. ESLint ルール遵守
4. コンポーネントは関数型で実装
5. 状態管理は Jotai 優先
6. API は v3 形式で実装
7. セキュリティチェック必須
8. 国際化対応
9. テストカバレッジ維持
10. パフォーマンス影響考慮