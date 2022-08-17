export class PageNode {

  constructor(pagePath) {
    this.pagePath = pagePath;
    this.children = [];

    this.page = undefined;
  }

  /**
   * calculate generations number of decendants
   *
   * ex:
   *  /foo          -2
   *  /foo/bar      -1
   *  /foo/bar/buz   0
   *
   * @returns generations num of decendants
   *
   * @memberOf PageNode
   */
  /*
   * commented out because it became unnecessary -- 2017.05.18 Yuki Takei
   *
  getDecendantsGenerationsNum() {
    if (this.children.length == 0) {
      return -1;
    }

    return -1 + Math.min.apply(null, this.children.map((child) => {
      return child.getDecendantsGenerationsNum();
    }))
  }
  */

  static instanciateFrom(obj) {
    const pageNode = new PageNode(obj.pagePath);
    pageNode.page = obj.page;

    // instanciate recursively
    pageNode.children = obj.children.map((childObj) => {
      return PageNode.instanciateFrom(childObj);
    });

    return pageNode;
  }

}
