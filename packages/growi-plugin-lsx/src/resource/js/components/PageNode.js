export class PageNode {

  pagePath;
  page;
  children;

  constructor(pagePath) {
    this.pagePath = pagePath;
    this.children = [];
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
  getDecendantsGenerationsNum() {
    if (this.children.length == 0) {
      return -1;
    }

    return -1 + Math.min.apply(null, this.children.map((child) => {
      return child.getDecendantsGenerationsNum();
    }))
  }

  static instanciateFrom(obj) {
    let pageNode = new PageNode(obj.pagePath);
    pageNode.page = obj.page;

    // instanciate recursively
    pageNode.children = obj.children.map((childObj) => {
      return PageNode.instanciateFrom(childObj);
    })

    return pageNode
  }
}
