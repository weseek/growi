# OpenTelemetry 改修タスク

## 進捗状況
**開始日**: 2025-06-19  
**完了予定**: 未設定

## タスク一覧

### Phase 1: カスタムメトリクス
- [x] **Resource Attributes拡張**
  - [x] サーバーURL属性追加（環境変数から取得）
  - [x] GROWI固有属性追加（基本情報）
  - [x] 環境情報属性追加
- [x] **System Metrics実装**
  - [x] CPU使用率収集（計算ロジックの実装が必要）
  - [x] メモリ使用率収集（process.memoryUsage()使用）
  - [x] 収集間隔設定（デフォルト15秒）
- [x] **Application Metrics実装**
  - [x] ダミーメトリクス実装（将来の拡張用）
  - [ ] ユーザー数メトリクス
  - [ ] ページ数メトリクス
  - [ ] 検索回数カウンター

### Phase 2: データ匿名化
- [x] **HTTP匿名化**
  - [x] クエリパラメータマスキング（`q`, `query`, `search`）
  - [x] HTTP Instrumentation統合
  - [x] 未使用コードの削除・リファクタリング
  - [ ] 認証ヘッダー除外（`authorization`, `cookie`）
  - [ ] IPアドレス部分マスキング
- [x] **設定機能**
  - [x] 匿名化有効/無効制御（環境変数）
  - [x] 設定の定数化
  - [ ] カスタム除外パターン設定

### Phase 3: 統合・テスト
- [ ] **統合テスト**
  - [ ] メトリクス送信確認
  - [ ] 匿名化動作確認
  - [ ] パフォーマンス影響測定
- [ ] **ドキュメント更新**
  - [ ] `overview.md`更新
  - [ ] 設定項目ドキュメント追加

## 実装メモ

### 実装場所
- **Resource Attributes**: `node-sdk-resource.ts`に追加
- **Custom Metrics**: 新規`custom-metrics.ts`作成
- **データ匿名化**: `node-sdk-configuration.ts`のHook設定

### 技術詳細
**カスタムメトリクス**:
- `@opentelemetry/api.metrics.getMeter()` でメーター取得
- `meter.createObservableGauge()` でシステムメトリクス作成
- `meter.addBatchObservableCallback()` で定期収集
- `os.cpus()`, `process.memoryUsage()` でシステム情報取得
- **重要**: CPU使用率計算ロジックは実装者が作成（OpenTelemetryは送信のみ）

**データ匿名化**:
- `@opentelemetry/instrumentation-http.HttpInstrumentation` の `requestHook` オプション
- `span.setAttribute()` で属性値を `'***'` に置換
- `URL.searchParams.set(param, '***')` でクエリパラメータマスキング
- 正規表現 `/(\?|&)(q|query|search)=([^&]*)/gi` で検索パラメータ検出

**Resource Attributes**:
- `@opentelemetry/resources.Resource` クラス
- `resource.merge(otherResource)` で既存リソースに追加
- `os.hostname()`, `process.env.NODE_ENV` で環境情報取得

### 設定例
```typescript
// Resource Attributes
const customResource = new Resource({
  'growi.server.url': process.env.GROWI_SERVER_URL,
  'growi.installation.type': detectInstallationType(),
});

// HTTP Hook
const httpInstrumentation = new HttpInstrumentation({
  requestHook: (span, request) => {
    // クエリパラメータ匿名化
    anonymizeSearchQueries(span);
  }
});
```

### 注意点
- 既存のOTEL設定に影響しないよう追加実装
- Feature Flagで段階的有効化
- パフォーマンス監視必須

---
*最終更新: 2025-06-19*  
*削除予定: 改修完了時*
