
export default class MarkdownFixer {
  process(markdown) {
    var x = markdown
      .replace(/^(#{1,})([^\s]+)?(.*)$/gm, '$1 $2$3') // spacer for section
      .replace(/>[\s]*\n>[\s]*\n/g, '> <br>\n> \n');

    return x;
  }
}
