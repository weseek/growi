const path = require('path');

export default class PukiwikiLikeLinker {

  process(markdown) {

    return markdown
      // see: https://regex101.com/r/k2dwz3/3
      .replace(/\[\[(([^(\]\])]+)>)?(.+?)\]\]/g, (all, group1, group2, group3) => {
        // create url
        // use 'group3' as is if starts from 'http(s)', otherwise join to 'window.location.pathname'
        const url = (group3.match(/^(\/|https?:\/\/)/)) ? group3 : path.join(window.location.pathname, group3);
        // determine alias string
        // if 'group2' is undefined, use group3
        const alias = group2 || group3;

        return `<a href="${url}">${alias}</a>`;
      });
  }

}
