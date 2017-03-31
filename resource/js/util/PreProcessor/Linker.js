
export default class Linker {
  process(markdown) {

    return markdown
      // process angle branckets like '</Level1/Level2>'
      .replace(/<((\/[^>]+?){2,})>/g, '<a href="$1">$1</a>') // ページ間リンク: <> でかこまれてて / から始まり、 / が2個以上
      // process square branckets like '[/Level1]'
      // see: https://regex101.com/r/QSt1yu/1
      .replace(/\[(\/[^\]]+?)\]/g, ' <a href="$1">$1</a>')
      ;
  }
}
