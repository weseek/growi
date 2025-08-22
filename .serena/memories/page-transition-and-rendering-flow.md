### ページ遷移とレンダリングフローの分析

このドキュメントは、ページ遷移から `PageView` コンポーネントのレンダリングまでのデータフローを、Jotai atom の役割に焦点を当てて概説します。

#### 1. ユーザーアクションとナビゲーションの開始

- ユーザーが `<Link>` コンポーネントをクリックするか、ブラウザの履歴を使用すると、Next.js の `useRouter` が URL の変更を検出します。
- これにより、`[[...path]].page.tsx` コンポーネントが再評価されます。

#### 2. `useSameRouteNavigation` フックによる遷移の処理

- `[[...path]].page.tsx` 内で呼び出される `useSameRouteNavigation` フックは、新しい `router.asPath` を `targetPathname` として検出します。
- `targetPathname` の変更によって `useEffect` がトリガーされます。
- `shouldFetchPage` ユーティリティは、現在のページ情報（`currentPageId`, `currentPagePath`）と遷移先の情報（`targetPageId`, `targetPathname`）を比較し、新しいページデータを取得する必要があるかどうかを判断します。

#### 3. `usePageStateManager` による状態の更新とデータ取得

- `useSameRouteNavigation` 内の `usePageStateManager` は `updatePageState` 関数を実行します。
- **`currentPageIdAtom` の更新**: `setCurrentPageId(targetPageId)` が呼び出され、最初にページIDが更新されます。**この時点では `targetPageId` は `null` です。**
- **データ取得の実行**: `fetchCurrentPage(targetPathname)` が呼び出されます。この関数は `useFetchCurrentPage` フックによって提供されます。

#### 4. `PageView` の中間レンダリング

- `setCurrentPageId(null)` が実行されると、`currentPageIdAtom` に依存するコンポーネントが再レンダリングされます。
- ログから、`PageView` が `currentPageId: undefined` の状態で2回再レンダリングされていることがわかります。これは、atomの更新がReactのレンダリングサイクルをトリガーするためです。この時点では、表示されているページの内容は古いままです。

#### 5. `useFetchCurrentPage` フックによるAPI通信とAtomの更新

- `fetchCurrentPage` は `useAtomCallback` で定義されており、Jotai atomを直接更新する権限を持っています。
- **API呼び出し**: `apiv3Get('/page', ...)` を実行して、サーバーから新しいページデータを取得します。
- **Atomの一括更新**: APIレスポンスを受け取ると、次のatomを更新します。
    - `pageLoadingAtom`: `false` に設定して、読み込み状態を終了します。
    - `pageErrorAtom`: エラーが発生した場合に設定されます。
    - `pageNotFoundAtom`: ページが見つからない場合に `true` に設定されます。
    - `currentPageDataAtom`: **これが最も重要な部分です。** 新しいページオブジェクト（`newData`）がこのatomに設定されます。
    - `currentPageIdAtom`: 取得したデータの `_id` で再度更新され、一貫性を確保します。

#### 6. `PageView` コンポーネントの最終レンダリング

- `useFetchCurrentPage` によって `currentPageDataAtom` と `currentPageIdAtom` の値が更新されると、`PageView` コンポーネントは新しい `page` オブジェクトと `currentPageId` で再度レンダリングされます。
- 再レンダリングされた `PageView` は、新しいページコンテンツ（タイトル、本文など）を表示します。

#### 7. ナビゲーションの完了と副作用

- データ取得後、`useSameRouteNavigation` 内で `mutateEditingMarkdown` が呼び出され、エディタの状態が更新されます。
- 最後に、Next.jsのルーターが `router.asPath` を `/6847d935c9748fb9fc99f435` のようなIDベースのパスに更新することがあり、これにより `useSameRouteNavigation` の `useEffect` が再度トリガーされますが、`isSamePageId` のチェックによって重複したデータ取得はスキップされます。

### Jotai Atomの役割の概要

- `currentPageIdAtom`: 現在表示されているページのIDを保持します。遷移の過程で一度 `null` または `undefined` になり、データ取得後に正しいIDで更新されます。
- `currentPageDataAtom`: 現在のページの完全なデータオブジェクト（`IPagePopulatedToShowRevision`）を保持します。このatomへの変更が、`PageView` の最終的な再レンダリングの直接のトリガーとなります。
- `pageLoadingAtom`: データ取得中の読み込み状態を管理します。
- `pageNotFoundAtom`: 存在しないページの状態を管理し、`NotFoundPage` の表示を制御します。
- `pageErrorAtom`: データ取得中に発生したエラーを保持します。
