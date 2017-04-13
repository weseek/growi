export class PageNode {

  page;
  children;

  constructor() {
    this.children = [];
  }

  /**
   * return generations num of decendants
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
}
