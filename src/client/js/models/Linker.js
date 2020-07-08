export default class Linker {

  constructor(type, label, link) {
    this.type = type;
    this.label = label;
    this.link = link;
    // TODO GW-3074 相対パスを利用しているかの情報も持つようにする
  }

  static types = {
    markdownLink: 'mdLink',
    growiLink: 'growiLink',
    pukiwikiLink: 'pukiwikiLink',
  }

  static patterns = {
    pukiwikiLinkWithLabel: /^\[\[(?<label>.+)>(?<link>.+)\]\]$/, // https://regex101.com/r/2fNmUN/2
    pukiwikiLinkWithoutLabel: /^\[\[(?<label>.+)\]\]$/, // https://regex101.com/r/S7w5Xu/1
    growiLink: /^\[(?<label>\/.+)\]$/, // https://regex101.com/r/DJfkYf/3
    markdownLink: /^\[(?<label>.*)\]\((?<link>.*)\)$/, // https://regex101.com/r/DZCKP3/2
  }

  // create an instance of Linker from string
  static fromMarkdownString(str) {
    // if str doesn't mean a linker, create a link whose label is str
    let label = str;
    let link = '';
    let type = this.types.markdownLink;

    // pukiwiki with separator ">".
    if (str.match(this.patterns.pukiwikiLinkWithLabel)) {
      type = this.types.pukiwikiLink;
      ({ label, link } = str.match(this.patterns.pukiwikiLinkWithLabel).groups);
    }
    // pukiwiki without separator ">".
    else if (str.match(this.patterns.pukiwikiLinkWithoutLabel)) {
      type = this.types.pukiwikiLink;
      ({ label } = str.match(this.patterns.pukiwikiLinkWithoutLabel).groups);
      link = label;
    }
    // growi
    else if (str.match(this.patterns.growiLink)) {
      type = this.types.growiLink;
      ({ label } = str.match(this.patterns.growiLink).groups);
      link = label;
    }
    // markdown
    else if (str.match(this.patterns.markdownLink)) {
      type = this.types.markdownLink;
      ({ label, link } = str.match(this.patterns.markdownLink).groups);
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
    let beginningOfLink;
    let endOfLink;

    // pukiwiki link ('[[link]]')
    [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[[', ']]');

    // if index is not in a pukiwiki link
    // growi link ('[/link]')
    if (beginningOfLink < 0 || endOfLink < 0 || beginningOfLink > index || endOfLink < index) {
      [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[/', ']');
    }

    // and if index is not in a growi link
    // markdown link ('[label](link)')
    if (beginningOfLink < 0 || endOfLink < 0 || beginningOfLink > index || endOfLink < index) {
      [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[', ')', '](');
    }

    // and if index is not in a markdown link
    // return { beginningOfLink: -1, endOfLink: -1 }
    if (beginningOfLink < 0 || endOfLink < 0 || beginningOfLink > index || endOfLink < index) {
      [beginningOfLink, endOfLink] = [-1, -1];
    }

    return { beginningOfLink, endOfLink };
  }

  // return begin and end indexies as array only when index is between prefix and suffix and link contains containText.
  static getBeginningAndEndIndexWithPrefixAndSuffix(line, index, prefix, suffix, containText = '') {
    const beginningIndex = line.lastIndexOf(prefix, index);
    const IndexOfContainText = line.indexOf(containText, beginningIndex + prefix.length);
    const endIndex = line.indexOf(suffix, IndexOfContainText + containText.length);

    if (beginningIndex < 0 || IndexOfContainText < 0 || endIndex < 0) {
      return [-1, -1];
    }
    return [beginningIndex, endIndex + suffix.length];
  }

}
