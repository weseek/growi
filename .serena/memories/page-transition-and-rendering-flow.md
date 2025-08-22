### ページ遷移とレンダリングフローの分析（リファクタリング後）

このドキュメントは、リファクタリング後のページ遷移から `PageView` コンポーネントのレンダリングまでのデータフローを、Jotai atom の役割に焦点を当てて概説します。

#### 登場人物

1.  **`[[...path]].page.tsx`**: Next.js の動的ルーティングを担うメインコンポーネント。
2.  **`useSameRouteNavigation.ts`**: クライアントサイドでのパス変更を検知し、データ取得をトリガーするフック。
3.  **`useFetchCurrentPage.ts`**: データ取得と関連する Jotai atom の更新を一元管理する、本リファクタリングの心臓部。
4.  **`useShallowRouting.ts`**: サーバーサイドで正規化されたパスとブラウザのURLを同期させるフック。
5.  **`server-side-props.ts`**: サーバーサイドレンダリング（SSR）時にページデータを取得し、`props` としてページコンポーネントに渡す。

---

#### フロー1: サーバーサイドレンダリング（初回アクセス時）

1.  **リクエスト受信**: ユーザーがURL（例: `/user/sotarok/memo`）に直接アクセスします。
2.  **`getServerSideProps` の実行**:
    - `server-side-props.ts` の `getServerSidePropsForInitial` が実行されます。
    - `retrievePageData` が呼び出され、パスの正規化（例: `/user/sotarok` → `/user/sotarok/`）が行われ、APIからページデータを取得します。
    - 取得したデータと、正規化後のパス (`currentPathname`) を `props` として `[[...path]].page.tsx` に渡します。
3.  **コンポーネントのレンダリング**:
    - `[[...path]].page.tsx` は `props` を受け取り、`PageView` などのコンポーネントをレンダリングします。
    - 同時に **`useShallowRouting`** が実行されます。
4.  **URLの正規化**:
    - `useShallowRouting` は、ブラウザのURL (`/user/sotarok/memo`) と `props.currentPathname` (`/user/sotarok/memo/`) を比較します。
    - 差異がある場合、`router.replace` を `shallow: true` で実行し、ブラウザのURLをサーバーが認識している正規化後のパスに静かに更新します。

---

#### フロー2: クライアントサイドナビゲーション（`<Link>` クリック時）

1.  **ナビゲーション開始**:
    - ユーザーが `<Link href="/new/page">` をクリックします。
    - Next.js の `useRouter` がURLの変更を検出し、`[[...path]].page.tsx` が再評価されます。
2.  **`useSameRouteNavigation` によるトリガー**:
    - このフックの `useEffect` が `router.asPath` の変更 (`/new/page`) を検知します。
    - **`fetchCurrentPage({ path: '/new/page' })`** を呼び出します。このフックの役割は、データ取得の「トリガー」に専念します。
3.  **`useFetchCurrentPage` によるデータ取得と状態更新**:
    - `fetchCurrentPage` 関数が実行されます。
    - **3a. 読み込み状態開始**: `pageLoadingAtom` を `true` に設定。
    - **3b. パス解析**: 引数の `path` をデコードし、パーマリンクかどうかを判定します。
    - **3c. APIパラメータ構築**: パスがパーマリンクなら `pageId`、通常パスなら `path` を使ってAPIリクエストのパラメータを組み立てます。
    - **3d. API通信**: `apiv3Get('/page', ...)` を実行します。
4.  **アトミックな状態更新**:
    - APIからデータが返ってきた後、関連する **すべてのatomを一度に更新** します。
        - `currentPageDataAtom`, `currentPageIdAtom`, `pageNotFoundAtom`, `pageLoadingAtom` など。
    - これにより、中間的な状態（`pageId`が`undefined`になるなど）が発生することなく、データが完全に揃った状態で一度だけ状態が更新されます。
5.  **`PageView` の最終レンダリング**:
    - `currentPageDataAtom` の更新がトリガーとなり、`PageView` コンポーネントが新しいデータで再レンダリングされます。
