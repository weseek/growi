# ページ状態管理のJotai移行提案

## 背景

現在のページ状態管理（`useCurrentPageId`, `useSWRxCurrentPage`, `useSWRMUTxCurrentPage`）は以下の問題を抱えています：

1. **複雑なshouldMutateロジック**: 4つの既知問題に対応するための複雑な条件分岐
2. **責務の分散**: 同一データに対して複数のhookが異なる責任を持つ
3. **状態同期の複雑さ**: 手動でのキャッシュ操作による同期問題
4. **SSR/CSRの境界問題**: 初期データの扱いが複雑

## 提案する移行戦略

### **戦略: ハイブリッドアプローチ（推奨）**

SWRとJotaiの併用により、それぞれの長所を活かしつつ問題を解決します。

#### **役割分担**
- **Jotai**: クライアントサイド状態管理（ページデータ、フラグ状態）
- **SWR**: データフェッチング（APIコール、エラーハンドリング）

#### **実装アーキテクチャ**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │◄───┤  Jotai Atoms    │◄───┤ SWR Fetchers    │
│                 │    │                 │    │                 │
│ - usePageData   │    │ - pageAtom      │    │ - useFetchCurrentPage│
│ - usePageId     │    │ - pageIdAtom    │    │ - API calls     │
│ - usePagePath   │    │ - statusAtoms   │    │ - Error handling│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### **メリット**

1. **複雑性の削減**: shouldMutateロジックが不要
2. **責務の明確化**: 状態管理とデータフェッチングが分離
3. **段階的移行**: 既存コードへの影響を最小化
4. **SWRの恩恵維持**: キャッシング、再試行、エラーハンドリング
5. **TypeScript親和性**: 優れた型推論

#### **デメリット**

1. **一時的な複雑さ**: 移行期間中の2つのシステム併存
2. **学習コスト**: Jotaiの新しいパターン習得

## 実装計画

### **一気移行戦略（推奨）**

影響範囲調査の結果、段階的移行ではなく**一気に移行**することを推奨します。

#### **移行可能性の根拠**

1. **拡大した影響範囲**: 約182箇所の使用箇所（manageable but significant）
2. **一貫したパターン**: 各hookの使用方法が標準化されている
3. **型安全性**: Jotai版は既存以上の型安全性を提供
4. **リスクの低さ**: 機能変更ではなく、実装方法の変更のみ
5. **完成したインフラ**: 新システムが完全に実装済み

#### **具体的な移行箇所（最新調査結果）**

**影響範囲統計:**
- **ファイル数**: 67ファイル
- **import文**: 75箇所
- **hook使用箇所**: 182箇所

**主要hook別移行内容:**

- **`useCurrentPageId`**: 複数箇所
  ```typescript
  // Before: { data: currentPageId } = useCurrentPageId()
  // After:  [currentPageId] = useCurrentPageId()
  ```

- **`useSWRxCurrentPage`**: 複数箇所  
  ```typescript
  // Before: { data: currentPage } = useSWRxCurrentPage()
  // After:  [currentPage] = useCurrentPageData()
  ```

- **`useSWRMUTxCurrentPage`**: 複数箇所
  ```typescript
  // Before: { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage()
  // After:  { fetchCurrentPage } = useFetchCurrentPage()
  ```

- **`useCurrentPagePath`**: 複数箇所（Deprecated）
  ```typescript
  // Before: { data: currentPagePath } = useCurrentPagePath()
  // After:  [currentPagePath] = useCurrentPagePath()
  ```

- **`useIsTrashPage`**: 複数箇所（Deprecated）
  ```typescript
  // Before: { data: isTrashPage } = useIsTrashPage()
  // After:  [isTrashPage] = useIsTrashPage()
  ```

- **`useIsRevisionOutdated`**: 複数箇所（Deprecated）
  ```typescript
  // Before: { data: isRevisionOutdated } = useIsRevisionOutdated()
  // After:  [isRevisionOutdated] = useIsRevisionOutdated()
  ```

### **Phase 1: 一括置換（2-3日）**

1. **Import文の更新（75箇所）**
   ```typescript
   // Before
   import { useCurrentPageId, useSWRxCurrentPage, useSWRMUTxCurrentPage } from '~/stores/page';
   
   // After
   import { useCurrentPageId, useCurrentPageData, useFetchCurrentPage } from '~/states/page';
   ```

2. **Hook使用箇所の一括変更（182箇所）**
   - 正規表現での一括置換を段階的に実行
   - TypeScriptコンパイラーでの検証
   - 各hook別の置換パターン適用

3. **SSRハイドレーション対応**
   ```typescript
   // ページコンポーネントで
   useHydratePageAtoms(pageWithMeta?.data ?? null);
   ```

4. **主要影響ファイル（67ファイル）**
   - `pages/[[...path]].page.tsx` - メインページコンポーネント
   - `components/PageView/**` - ページビュー関連コンポーネント
   - `components/PageEditor/**` - エディター関連コンポーネント
   - `client/services/**` - サービス層コンポーネント
   - `stores/ui.tsx` - UI状態管理

### **Phase 2: 検証とクリーンアップ（1-2日）**

1. **動作確認**
   - 主要ページでの動作テスト（67ファイル）
   - エラーログの確認
   - TypeScript型チェック（182箇所）

2. **旧コードの削除**
   - `~/stores/page.tsx`からの該当hook削除
   - 未使用importの整理（75箇所のimport文更新）

3. **型チェック**
   - TypeScriptエラーの解消
   - lint警告の対応
   - 段階的な検証プロセス

### **Phase 3: 旧システム削除（半日）**

1. **旧hook定義の削除**
2. **関連する複雑なshouldMutateロジックの削除**  
3. **ドキュメント更新**

## 移行後の改善効果

### **コードの簡潔性**
```typescript
// Before (複雑なshouldMutate)
const shouldMutate = (() => {
  if (initialData === undefined) return false;
  if (initialData == null) return true;
  
  const cachedData = cache.get(key)?.data;
  if (initialData._id !== cachedData?._id) return true;
  
  if (cachedData?.revision == null && initialData.revision != null) return true;
  
  if (!isLatestRevision && 
      cachedData.revision?._id != null && 
      initialData.revision?._id != null &&
      cachedData.revision._id !== initialData.revision._id) {
    return true;
  }
  return false;
})();

// After (シンプルなJotai更新)
setCurrentPage(initialData);
```

### **型安全性の向上**
```typescript
// Jotaiの優れた型推論
const [pageId, setPageId] = useCurrentPageIdNew(); // string | null
const [pagePath] = useCurrentPagePath(); // string | null (computed)
```

### **デバッグの容易さ**
- Jotai DevToolsによる状態可視化
- 明確な状態変更フロー
- 副作用の分離

## リスク評価と対策

### **リスク**
1. **移行期間の複雑さ**: 2つのシステムが併存
2. **パフォーマンス懸念**: 追加の状態管理レイヤー
3. **学習コスト**: 新しいパターンの習得

### **対策**
1. **段階的移行**: 機能単位での慎重な移行
2. **十分なテスト**: 既存機能の回帰防止
3. **ドキュメント整備**: 移行パターンの標準化
4. **レビュープロセス**: 移行品質の確保

## 結論

**一気移行による速やかな問題解決を推奨**します。この戦略により：

1. **即座の効果**: shouldMutateの複雑性を5-6日で完全解決
2. **リスクの最小化**: 段階的移行による中間状態の複雑さを回避
3. **開発効率**: 移行期間中の二重管理コストを削減
4. **保守性向上**: クリーンなアーキテクチャへの迅速な移行

約182箇所、67ファイルという拡大した影響範囲ですが、一貫したパターンの変更であり、新システムのインフラが完全に整備されているため、慎重な段階的移行が適切です。

## 追加で実装済みの機能

### **Jotai実装の完成**
- ✅ **`~/states/page/internal-atoms.ts`**: 内部atom定義
- ✅ **`~/states/page/hooks.ts`**: 公開hookインターフェース  
- ✅ **`~/states/page/page-fetcher.ts`**: ハイブリッドSWR+Jotaiフェッチャー
- ✅ **`~/states/page/index.ts`**: 統合エクスポート
- ✅ **`~/states/hydrate/page.ts`**: SSRハイドレーション対応

### **移行インフラ**
- ✅ **型安全性**: 完全なTypeScript対応
- ✅ **互換API**: 既存コードとの互換性確保
- ✅ **SSR対応**: `useHydratePageAtoms`による初期化
- ✅ **エラーハンドリング**: SWRエラーパターンの維持
- ✅ **デバッグ支援**: Jotai DevTools対応
