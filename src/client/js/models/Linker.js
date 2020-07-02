const types = {
  markdownLink: 'mdLink',
  growiLink: 'growiLink',
  pukiwikiLink: 'pukiwikiLink',
}

const isApplyPukiwikiLikeLinkerPlugin = window.growiRenderer.preProcessors.some(process => process.constructor.name === 'PukiwikiLikeLinker');

export default class Linker {

  constructor(type, label, link) {
    this.type = type;
    this.label = label;
    this.link = link;
  }

  // create a linker from string
  static fromMarkdownString(str) {
    // if str doesn't mean a linker, create markdown link whose label is str
    let label=str;
    let link='';
    let type=types.markdownLink;

    // pukiwiki
    // https://regex101.com/r/2fNmUN/1
    if (str.match(/^\[\[.*\]\]$/) && isApplyPukiwikiLikeLinkerPlugin) {
      type = types.pukiwikiLink;
      const value = str.slice(2, -2);
      const indexOfSplit = value.lastIndexOf('>');
      if (indexOfSplit < 0) {
        label = value;
        link = value;
      }
      label = value.slice(0, indexOfSplit);
      link = value.slice(indexOfSplit + 1);
    }
    // growi
    // https://regex101.com/r/DJfkYf/1
    else if (str.match(/^\[\/.*\]$/)) {
      type = types.growiLink;
      const value = str.slice(1, -1);
      label = value;
      link = value;
    }
    // markdown
    // https://regex101.com/r/DZCKP3/1
    else if (str.match(/^\[.*\]\(.*\)$/)) {
      type = types.markdownLink;
      const value = MarkdownLink.slice(1, -1);
      const indexOfSplit = value.lastIndexOf('](');
      label = value.slice(0, indexOfSplit);
      link = value.slice(indexOfSplit + 2);
    }

    return new Linker(type, label, link);
  }

  // create a linker from text with index
  static fromLineWithIndex(line, index) {
    const { beginningOfLink, endOfLink } = this.getBeginningAndEndIndexOfLink(line, index);
    let linkStr = '';
    if (beginningOfLink < 0 || endOfLink < 0) {
     linkStr = line.substring(beginningOfLink, endOfLink);
    }
    return this.fromMarkdownString(linkStr);
  }

  // return beginning index and end index of the closest link to index
  // if there is no link, return { beginningOfLink: -1, endOfLink: -1}
  static getBeginningAndEndIndexOfLink(line, index) {
    let beginningOfLink, endOfLink;

    // growi link ('[/link]')
    [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[/', ']');

    // markdown link ('[label](link)')
    [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[', ')', '](');

    // pukiwiki link ('[[link]]')
    if (isApplyPukiwikiLikeLinkerPlugin) {
      [beginningOfLink, endOfLink] = this.getBeginningAndEndIndexWithPrefixAndSuffix(line, index, '[[', ']]');
    }

    return { beginningOfLink, endOfLink };
  }

  // return begin and end indexies as array only when index between prefix and suffix.
  // if line doesn't contain containText, return null.
  static getBeginningAndEndIndexWithPrefixAndSuffix(line, index, prefix, suffix, containText=null) {
    const beginningIndex = line.lastIndexOf(prefix, index + prefix.length);
    let startIndex = beginningIndex;
    if (containText != null){
      startIndex = line.indexOf(containText, beginningOfLink);
    }
    const endIndex = line.indexOf(suffix, startIndex);

    if (beginningIndex < 0 || endIndex < 0 || startIndex < 0) {
      return [-1, -1];
    }

    return [beginningIndex, endIndex + suffix.lengt];
  }

}
