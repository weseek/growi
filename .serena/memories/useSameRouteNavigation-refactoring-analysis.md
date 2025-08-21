# useSameRouteNavigation リファクタリング分析

## 現在の状況 (2025-08-21)

### 既に完了した改善点 ✅
1. **isInitialProps関数の抽出** - navigation-utils.tsに移動済み
2. **shouldFetchPage関数の抽出** - Pure functionとして分離済み  
3. **型安全性の向上** - 適切なTypeScript型定義追加
4. **TSDocコメント** - 適切なドキュメンテーション追加

### コード品質の現状評価

#### 🟢 良好な点
- **関数の抽出**: ユーティリティ関数が適切に分離されている
- **Pure functions**: shouldFetchPage, extractPageIdFromPathnameは副作用なし
- **型安全性**: 適切なTypeScript型定義
- **コメント**: 意図が明確なTSDoc
- **ブラウザナビゲーション対応**: router.asPathでバック/フォワード対応済み

#### 🟡 改善可能な点

##### **1. 責任分解 (Single Responsibility)**
現在の`useSameRouteNavigation`は以下の複数責任を持つ：
- パスナビゲーション検出
- SSR初期データ判定
- フェッチ必要性判定
- 同期処理制御（重複防止）
- 非同期データフェッチ実行
- 状態更新（pageId, editingMarkdown）
- エラーハンドリング

**改善案**: カスタムフックの分割
```typescript
// 各責任を分離したカスタムフック
const useNavigationTarget = (router, props) => string
const useInitialDataCheck = (props) => boolean  
const useFetchController = () => { shouldFetch, executeFetch }
const usePageStateUpdater = () => (pathname) => Promise<void>
```

##### **2. パフォーマンス最適化**
**問題点**:
- useEffectの依存配列に`props.currentPathname`と`router.asPath`両方
- propsが変更されるたびに全体的な再計算
- 大きなuseEffect内で複数のフック呼び出し

**改善案**:
```typescript
// メモ化によるパフォーマンス改善
const targetPathname = useMemo(() => 
  router.asPath || props.currentPathname, [router.asPath, props.currentPathname]
);

const hasInitialData = useMemo(() => 
  isInitialProps(props) && !props.skipSSR, [props]
);
```

##### **3. 可読性の向上**
**問題点**:
- 85行の巨大なuseEffect
- ネストした条件分岐
- 非同期関数の即座実行

**改善案**:
```typescript
// useEffect内ロジックの関数化
const useNavigationEffect = (targetPathname, hasInitialData, ...) => {
  // Early returns for clarity
  if (/* conditions */) return;
  
  // Extracted update logic
  handlePageNavigation(targetPathname);
}
```

##### **4. エラーハンドリングの改善**
**現在**: サイレントエラーハンドリング（errorを無視）
```typescript
catch (error) {
  // Silent error handling - errors are logged by the caller if needed
}
```

**改善案**: 適切なエラー境界とログ
```typescript
catch (error) {
  console.error('Navigation failed:', error);
  // Optional: Error boundary notification
  // Optional: Fallback state setting
}
```

##### **5. テスタビリティの向上**
**問題点**: 
- 複数の外部依存（router, state hooks）
- 複雑な条件分岐ロジック
- 非同期処理の複雑な制御

**改善案**:
- ビジネスロジックの純粋関数化
- 依存性注入パターンの採用
- モック化しやすいインターフェース設計

## 推奨リファクタリング順序

### Phase 1: メモ化による最適化 (Low Risk)
1. `useMemo`でtargetPathname計算を最適化
2. `useMemo`でhasInitialData計算を最適化
3. パフォーマンステスト実行

### Phase 2: カスタムフック分割 (Medium Risk)  
1. `useNavigationTarget`フック抽出
2. `useInitialDataCheck`フック抽出
3. `useFetchController`フック抽出
4. `usePageStateUpdater`フック抽出
5. 各段階でテスト実行

### Phase 3: エラーハンドリング改善 (Low Risk)
1. 適切なログ追加
2. エラー境界対応
3. フォールバック状態定義

### Phase 4: 最終リファクタリング (Medium Risk)
1. useEffect内ロジックの関数化
2. 条件分岐の簡素化
3. 最終的なテスト・パフォーマンス検証

## 品質指標

### 目標メトリクス
- **関数の行数**: 各関数20行以下
- **useEffectの複雑度**: Cyclomatic complexity < 5
- **テストカバレッジ**: 95%以上維持
- **再レンダリング回数**: 現状維持または改善

### 成功基準
- [ ] 単一責任原則の遵守
- [ ] パフォーマンス回帰なし
- [ ] テスト通過率100%維持
- [ ] ブラウザナビゲーション機能の維持
- [ ] 可読性の主観的改善（レビュー）