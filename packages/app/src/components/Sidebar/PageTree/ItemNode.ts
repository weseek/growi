import { IPage } from '~/interfaces/page';

type IPageForItem = Partial<IPage> & {isTarget?: boolean};

export class ItemNode {

  page: IPageForItem;

  children?: ItemNode[];

  isPartialChildren?: boolean;

  constructor(page: IPageForItem, children: ItemNode[] = [], isPartialChildren = false) {
    this.page = page;
    this.children = children;
    this.isPartialChildren = isPartialChildren;
  }

  hasChildren(): boolean {
    return this.children != null && this.children?.length > 0;
  }

}
