# Jotai 移行ガイド

> **📊 最新の進捗状況**: [`jotai-migration-progress.md`](jotai-migration-progress.md) を参照

## 1. 背景と移行方針

### 課題
- `useSWRStatic` や `useContextSWR` による複雑な状態管理
- パフォーマンスの問題と潜在的なバグ
- 責務の不明確性

### 解決方針
**役割分担の明確化:**
- **SWR**: データフェッチング、サーバーキャッシュ管理に特化
- **Jotai**: クライアントサイドUI状態、同期的な状態管理に特化

## 2. 実装ガイド

### ディレクトリ構造

```
states/
├── ui/
│   ├── sidebar.ts      # サイドバー状態 ✅
│   ├── device.ts       # デバイス状態 ✅
│   ├── editor.ts       # エディター状態 ✅（部分）
│   ├── page.ts         # ページ関連状態（次の対象）
│   └── modal.ts        # モーダル状態（未作成）
└── hydrate/
    └── sidebar.ts      # SSRハイドレーション ✅
```

### 実装パターン

#### 永続化対応パターン
```typescript
// 永続化が必要な状態
const someSettingAtom = atom(defaultValue);
const someSettingAtomExt = atom(
  get => get(someSettingAtom),
  (get, set, update: ValueType) => {
    set(someSettingAtom, update);
    scheduleToPut({ settingKey: update });
  },
);

export const useSomeSetting = () => useAtom(someSettingAtomExt);
```

#### 一時的な状態パターン
```typescript
// 永続化不要な一時的な状態
const temporaryStateAtom = atom(defaultValue);

export const useTemporaryState = () => useAtom(temporaryStateAtom);
```

#### SSRハイドレーションパターン
```typescript
// states/hydrate/feature.ts
export const useHydrateFeatureAtoms = (initialData: InitialData) => {
  useHydrateAtoms([
    [featureAtom, initialData.feature],
    // 他のatoms...
  ]);
};
```

### 命名規則
- **Atom**: `{feature}Atom`
- **Hook**: `use{Feature}`
- **永続化対応**: `{feature}AtomExt`

## 3. 判断基準

### Jotai移行対象
- ✅ クライアントサイド完結のUI状態
- ✅ 同期的な状態更新
- ✅ シンプルなデータ構造
- ✅ コンポーネント間での状態共有が必要

### SWR継続使用対象
- ❌ サーバーからのデータフェッチが必要
- ❌ 非同期的な状態更新
- ❌ キャッシュ機能が重要
- ❌ リアルタイム更新が必要

## 4. 移行の成果

### 技術的改善
- **コードの簡潔化**: 複雑なSWRベースのカスタムフックがシンプルなatomsに
- **責務の分離**: データフェッチングとクライアント状態管理の明確な分離
- **TypeScript親和性**: 優れた型推論とタイプセーフティ
- **パフォーマンス改善**: 必要な箇所のみの再レンダリング
- **保守性向上**: 状態の依存関係が明確化

### 開発体験の向上
- **直感的なAPI**: React の `useState` に近い使用感
- **デバッグの容易さ**: 状態の変更が追跡しやすい
- **テストの簡素化**: モックやテストデータの管理が簡単

---

## 5. 技術スタック

- **Jotai**: v2.x（アトミックな状態管理）
- **SSR対応**: `useHydrateAtoms`（公式パターン）
- **永続化**: 既存の`scheduleToPut`機構と連携
- **TypeScript**: 型推論とタイプセーフティ

---

## 6. 今後の対応予定

### 動的ルーティング時に更新が必要な値
以下の値は Next.js の dynamic routing によるページ遷移時に値の更新が必要な可能性があります：

- **currentPathname** - ページ遷移時に現在のパスが変更される
- **isIdenticalPath** - ページごとに異なる値を持つ
- **isForbidden** - ページのアクセス権限がページごとに異なる
- **isNotCreatable** - ページの作成可能性がページごとに異なる
- **csrfToken** - セキュリティ要件によってはページ遷移時に更新が必要（既に対応済み）

これらの値については、現在のSWR実装から段階的にJotaiへの移行を検討する必要があります。
移行時には以下の点を考慮する必要があります：

1. **ページ遷移時の同期**: `useEffect` と `useRouter` を使用した値の同期
2. **初期値の設定**: `useHydrateAtoms` による SSR からの初期値設定
3. **永続化の必要性**: 一時的な状態かユーザー設定として永続化が必要かの判断
