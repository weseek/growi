var path = require('path');

export default class PukiwikiLikeLinker {
  process(markdown) {

    return markdown
      // see: https://regex101.com/r/k2dwz3/3
      .replace(/\[\[(([^(\]\])]+)>)?(.+?)\]\]/g, function(all, group1, group2, group3) {
        // create url
        // http(s) から始まっていればそのまま利用、そうでなければ window.location.pathname と連結
        var url = (group3.match(/^https?:\/\//)) ? group3 : path.join(window.location.pathname, group3);
        // determine alias string
        // エイリアス指定があれば利用、そうでなければリンク指定文字列をそのまま利用
        var alias = group2 ? group2 : group3;

        return `<a href="${url}">${alias}</a>`
      });
  }
}
