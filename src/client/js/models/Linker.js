export default class Linker {

  constructor(type, label, link) {
    this.type = type;
    this.label = label;
    this.link = link;
  }

  static types = {
    markdownLink: 'mdLink',
    growiLink: 'growiLink',
    pukiwikiLink: 'pukiwikiLink',
  }

  // create an instance of Linker from string
  static fromMarkdownString(str) {
    // if str doesn't mean a linker, create a link whose label is str
    let label=str;
    let link='';
    let type=this.types.markdownLink;

    // pukiwiki
    // https://regex101.com/r/2fNmUN/1
    if (str.match(/^\[\[.*\]\]$/)) {
      type = this.types.pukiwikiLink;
      const value = str.slice(2, -2);
      const indexOfSplit = value.lastIndexOf('>');
      if (indexOfSplit < 0) {
        label = value;
        link = value;
      }
      else {
        label = value.slice(0, indexOfSplit);
        link = value.slice(indexOfSplit + 1);
      }
    }
    // growi
    // https://regex101.com/r/DJfkYf/1
    else if (str.match(/^\[\/.*\]$/)) {
      type = this.types.growiLink;
      const value = str.slice(1, -1);
      label = value;
      link = value;
    }
    // markdown
    // https://regex101.com/r/DZCKP3/1
    else if (str.match(/^\[.*\]\(.*\)$/)) {
      type = this.types.markdownLink;
      const value = str.slice(1, -1);
      const indexOfSplit = value.lastIndexOf('](');
      label = value.slice(0, indexOfSplit);
      link = value.slice(indexOfSplit + 2);
    }

    return new Linker(type, label, link);
  }

  // create an instance of Linker from text with index
  static fromLineWithIndex(line, index) {
    const { beginningOfLink, endOfLink } = this.getBeginningAndEndIndexOfLink(line, index);
    // if index is in a link, extract it from line
    let linkStr = '';
    if (beginningOfLink >= 0 && endOfLink >= 0) {
      linkStr = line.substring(beginningOfLink, endOfLink);
    }
    return this.fromMarkdownString(linkStr);
  }

  // return beginning and end indexies of link
  // if index is not in a link, return { beginningOfLink: -1, endOfLink: -1 }
  static getBeginningAndEndIndexOfLink(line, index) {
    let beginningOfLink, endOfLink;

    // pukiwiki link ('[[link]]')
    [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[[', ']]');

    // if index is not in a pukiwiki link
    // growi link ('[/link]')
    if (beginningOfLink < 0 || endOfLink < 0 || beginningOfLink > index || endOfLink < index){
      [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[/', ']');
    }

    // and if index is not in a growi link
    // markdown link ('[label](link)')
    if (beginningOfLink < 0 || endOfLink < 0 || beginningOfLink > index || endOfLink < index){
      [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[', ')', '](');
    }

    // and if index is not in a markdown link
    // return { beginningOfLink: -1, endOfLink: -1 }
    if (beginningOfLink < 0 || endOfLink < 0 || beginningOfLink > index || endOfLink < index) {
      [beginningOfLink, endOfLink] = [-1, -1];
    };

    return { beginningOfLink, endOfLink };
  }

  // return begin and end indexies as array only when index is between prefix and suffix and link contains containText.
  static getBeginningAndEndIndexWithPrefixAndSuffix(line, index, prefix, suffix, containText='') {
    const beginningIndex = line.lastIndexOf(prefix, index);
    const IndexOfContainText = line.indexOf(containText, beginningIndex + prefix.length);
    const endIndex = line.indexOf(suffix, IndexOfContainText + containText.length);

    if (beginningIndex < 0 || IndexOfContainText < 0 || endIndex < 0) {
      return [-1, -1];
    }
    return [beginningIndex, endIndex + suffix.length];
  }

}
