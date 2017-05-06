
export default class Linker {
  process(markdown) {

    return markdown
      .replace(/\s\[(\/[^\]]+?)\](?!\()/g, ' <a href="$1">$1</a>') // ページ間リンク: [] でかこまれてて / から始まる
      .replace(/\s<((\/[^>]+?){2,})>/g, ' <a href="$1">$1</a>') // ページ間リンク: <> でかこまれてて / から始まり、 / が2個以上
      ;
  }
}
