# OpenTelemetry Custom Metrics Implementation Guide

## 改修実装状況

### ✅ 完了した実装

#### 1. Resource Attributes
- **OS情報**: `src/features/opentelemetry/server/custom-resource-attributes/os-resource-attributes.ts`
  - OS種別、プラットフォーム、アーキテクチャ、総メモリ量
- **アプリケーション固定情報**: `src/features/opentelemetry/server/custom-resource-attributes/application-resource-attributes.ts`
  - サービス・デプロイメントタイプ、添付ファイルタイプ、インストール情報

#### 2. Info Metrics
- **実装場所**: `src/features/opentelemetry/server/custom-metrics/application-metrics.ts`
- **メトリクス**: `growi.info` (値は常に1、情報はラベルに格納)
- **収集情報**: サービスインスタンスID、サイトURL、Wiki種別、外部認証タイプ

#### 3. Custom Metrics
- **実装場所**: `src/features/opentelemetry/server/custom-metrics/user-counts-metrics.ts`
- **メトリクス**: 
  - `growi.users.total` - 総ユーザー数
  - `growi.users.active` - アクティブユーザー数

### 📋 次のステップ

#### Resource Attributesの統合
1. `node-sdk-configuration.ts` でResource Attributesを統合する
2. 既存のResource設定に新しいAttributesを追加する

```typescript
// 統合例
import { getOsResourceAttributes, getApplicationResourceAttributes } from './custom-resource-attributes';

const osAttributes = getOsResourceAttributes();
const appAttributes = await getApplicationResourceAttributes();

resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'growi',
  [ATTR_SERVICE_VERSION]: version,
  ...osAttributes,
  ...appAttributes,
});
```

#### メトリクス収集の統合
1. 既存のメトリクス初期化処理にユーザー数メトリクスを追加する

```typescript
// 統合例
import { addApplicationMetrics } from './custom-metrics/application-metrics';
import { addUserCountsMetrics } from './custom-metrics/user-counts-metrics';

// メトリクス初期化時に両方を呼び出す
addApplicationMetrics();
addUserCountsMetrics();
```

## ファイル構成

```
src/features/opentelemetry/server/
├── custom-resource-attributes/
│   ├── index.ts                           # エクスポート用インデックス
│   ├── os-resource-attributes.ts          # OS情報
│   └── application-resource-attributes.ts # アプリケーション情報
├── custom-metrics/
│   ├── application-metrics.ts             # Info Metrics (更新済み)
│   └── user-counts-metrics.ts             # ユーザー数メトリクス (新規)
└── docs/
    ├── custom-metrics-architecture.md     # アーキテクチャ文書
    └── implementation-guide.md            # このファイル
```

## 設計のポイント

1. **循環依存の回避**: 動的importを使用してgrowiInfoServiceを読み込み
2. **エラーハンドリング**: 各メトリクス収集でtry-catchを実装
3. **型安全性**: Optional chainingを使用してundefinedを適切に処理
4. **ログ出力**: デバッグ用のログを各段階で出力
