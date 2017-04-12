import urlgrey from 'urlgrey';

export class PageNode {

  path;
  page;
  pageName;
  children;

  constructor(path, page = undefined) {
    this.path = path;
    this.pageName = decodeURIComponent(urlgrey(path).child());
    this.page = page;
    this.children = [];
  }
}
