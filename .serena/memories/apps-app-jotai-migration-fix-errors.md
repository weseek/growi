# 概要
apps/app 配下で pnpm run lint:typecheck をすると沢山のエラーがでるが、これはリファクタの影響である
そのエラーを潰したい

# エラータイプA

## エラーメッセージ例

```
src/client/components/Me/BasicInfoSettings.tsx:8:10 - error TS2724: '"~/states/server-configurations"' has no exported member named 'useRegistrationWhitelist'. Did you mean 'registrationWhitelistAtom'?

8 import { useRegistrationWhitelist } from '~/states/server-configurations';
           ~~~~~~~~~~~~~~~~~~~~~~~~
```

## 原因・経緯

server-configurations.ts からカスタムフックを消したため、インポートできなくなっている

## 対策
useFoo() は使えないので、fooAtom を直接 import する

```
import { fooAtom } from '~/states/server-configurations';
```

利用側は以下:

```
// 旧コード例
const [foo, setFoo] = useFoo();
const [foo] = useFoo();
const [, setFoo] = useFoo();

// 置き換え新コード例
const foo = useAtomValue(fooAtom);
const setFoo = useSetAtom(fooAtom);
```

useAtomValue と useSetAtom は以下のようにインポートできる

```
import { useAtomValue } from 'jotai';
import { useSetAtom } from 'jotai';
```

# エラータイプB

## エラーメッセージ例
```
src/client/components/PageControls/PageControls.tsx:139:9 - error TS2488: Type 'boolean | null' must have a '[Symbol.iterator]()' method that returns an iterator.

139   const [isSearchPage] = useIsSearchPage();
```

## 原因・経緯
`useFoo()` の返り値の型が変わった

具体的には、useAtom() 利用から useAtomValue() 利用に変わった

## 対策

```
// 旧コード例
const [foo, setFoo] = useFoo();
const [foo] = useFoo();
const [, setFoo] = useFoo();

// 置き換え新コード例
const foo = useAtomValue(fooAtom);
const setFoo = useSetAtom(fooAtom);
```