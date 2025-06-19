# OpenTelemetry 改修計画

## 改修内容

### 1. カスタムメトリクス送信
**目的**: システム情報とカスタム属性の送信

**追加メトリクス**:
- CPU使用率、メモリ使用量（手動実装が必要）
- GROWI固有情報（ユーザー数、ページ数等）
- サーバーURL、環境情報

**実装方針**:
- **Resource Attributes**: 永続的情報（サーバーURL等）
- **Custom Metrics**: 動的情報（CPU・メモリ等、取得ロジックを実装）

### 2. データ匿名化
**目的**: 機密情報の除外・マスキング

**対象データ**:
- 検索クエリパラメータ（`?q=secret` → `?q=***`）
- 認証ヘッダー（完全除外）
- IPアドレス（部分マスキング）

**実装方針**:
- **HTTP Instrumentation Hook**: リクエスト/レスポンス時の匿名化
- **Metric Views**: メトリクス属性のフィルタリング

## 技術選択

### OpenTelemetry標準の活用
- **セマンティックコンベンション**: 標準メトリクス名を使用
- **Resource Detection**: 環境情報の自動検出
- **Instrumentation Hook**: 既存の拡張ポイントを活用

### 設定方式
- **環境変数**: 基本設定
- **Feature Flag**: 段階的有効化
- **Hook Functions**: カスタムロジック

## 非機能要件
- **パフォーマンス影響**: CPU +5%以下、メモリ +50MB以下
- **セキュリティ**: 機密データの完全匿名化
- **運用性**: 設定での有効/無効制御

## 技術実装方針

### カスタムメトリクス
**パッケージ**: `@opentelemetry/api`
- **Resource**: `new Resource(attributes)` でカスタム属性追加
- **Meter**: `metrics.getMeter('growi-metrics')` でカスタムメーター作成
- **ObservableGauge**: `meter.createObservableGauge()` でシステムメトリクス
- **システム情報**: Node.js標準の `os` モジュール（`os.cpus()`, `os.totalmem()`）
- **注意**: CPU・メモリ使用率は自動収集されないため、取得ロジックの実装が必要

### データ匿名化
**パッケージ**: `@opentelemetry/instrumentation-http`
- **RequestHook**: `HttpInstrumentation({ requestHook: (span, request) => {} })` 
- **ResponseHook**: `HttpInstrumentation({ responseHook: (span, response) => {} })`
- **Metric Views**: `MeterProvider({ views: [{ attributeKeys: [...] }] })` で属性フィルタ
- **URL操作**: 標準 `URL` クラスで `searchParams.set(key, '***')`

## 参考情報
- [OpenTelemetry Node.js SDK](https://open-telemetry.github.io/opentelemetry-js/)
- [Custom Metrics Documentation](https://opentelemetry.io/docs/instrumentation/js/manual/#creating-metrics)
- [HTTP Instrumentation Configuration](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http#configuration)
- [Semantic Conventions for System Metrics](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/system/system-metrics.md)
- [Resource Semantic Conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/resource/README.md)

---
*作成日: 2025-06-19*  
*削除予定: 改修完了時*
