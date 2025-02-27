# remark-growi-directive

以下の要領で replace する

## 1. HTMLタグ内で `$lsx()` を利用している箇所
- 置換対象文章の詳細
  - `$lsx()`がHTMLタグ内かつ、当該`$lsx()`記述の1行前が空行ではない場合に1行前に空行を挿入
  - `$lsx()`がHTMLタグ内かつ、`$lsx()`記述行の行頭にインデントがついている場合に当該行のインデントを削除
  - `$lsx()`がHTMLタグ内かつ、当該`$lsx()`記述の1行後のHTMLタグ記述行にインデントがついている場合にその行頭のインデントを削除

## 2. `$lsx()` を利用している箇所
- 置換対象文章の詳細
  - `$lsx()`の引数内で括弧 `()` を使用している場合、括弧を削除
    - before: `$lsx()`(depth=2, filter=(業務課))
    - after: `$lsx()`(depth=2, filter=業務課)

## テストについて

以下を満たす

- input が `example.md` のとき、`example-expected.md` を出力する
- input が `example-expected.md` のとき、`example-expected.md` を出力する (変更が起こらない)

