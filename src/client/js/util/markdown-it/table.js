export default class TableConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  clickHandler(markdownTableStr) {
    this.crowi.launchTableModal(markdownTableStr);
  }

  configure(md) {
    md.renderer.rules.table_open = (tokens, idx) => {
      const markdownTableStr = "tokensから取得";
      return '<table class="table table-bordered"><button onclick="clickHander(markdownTableStr)"></button>';
    };
  }

}
