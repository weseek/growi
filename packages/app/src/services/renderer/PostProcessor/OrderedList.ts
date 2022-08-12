export default class OrderedList {

  process(html, context) {
    const { markdown: md } = context;
    // const parserdHTMLString = context.parsedHTML?.replace('/\\n|\\/g', '');
    // console.log(parserdHTMLString);
    const orderedListHTMLxRE = /<li.*\s*\d+[.)]\s*.*[\s\S]+?<\/li>/gm;


    const matchAllOrderedListHtml = html.matchAll(orderedListHTMLxRE);
    const orderedListRE = /^(\s*)(\d+)([.)])(\s*)(.*)/gm;
    console.log(...matchAllOrderedListHtml);

    // TODO: Create new list from parsed HTML and replace the html
    return html;
  }

}
