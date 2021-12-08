import React, { FC } from 'react';

import { IPageHasId } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageAncestorsChildren, useSWRxRootPage } from '../../../stores/page-listing';
import { TargetAndAncestors } from '~/interfaces/page-listing-results';
import { toastError } from '~/client/util/apiNotification';
import PageDeleteModal, { IPageForPageDeleteModal } from '~/components/PageDeleteModal';

/*
 * Utility to generate initial node
 */
const generateInitialNodeBeforeResponse = (targetAndAncestors: Partial<IPageHasId>[]): ItemNode => {
  const nodes = targetAndAncestors.map((page): ItemNode => {
    return new ItemNode(page, []);
  });

  // update children for each node
  const rootNode = nodes.reduce((child, parent) => {
    parent.children = [child];
    return parent;
  });

  return rootNode;
};

const generateInitialNodeAfterResponse = (ancestorsChildren: Record<string, Partial<IPageHasId>[]>, rootNode: ItemNode): ItemNode => {
  const paths = Object.keys(ancestorsChildren);

  let currentNode = rootNode;
  paths.reverse().forEach((path) => {
    const childPages = ancestorsChildren[path];
    currentNode.children = ItemNode.generateNodesFromPages(childPages);

    const nextNode = currentNode.children.filter((node) => {
      return paths.includes(node.page.path as string);
    })[0];
    currentNode = nextNode;
  });

  return rootNode;
};

type ItemsTreeProps = {
  targetPath: string
  targetId?: string
  targetAndAncestorsData?: TargetAndAncestors

  // for deleteModal
  isDeleteModalOpen: boolean
  pagesToDelete: IPageForPageDeleteModal[]
  isAbleToDeleteCompletely: boolean
  isDeleteCompletelyModal: boolean
  onCloseDelete(): void
  onClickDeleteByPage(page: IPageForPageDeleteModal): void
}

const renderByInitialNode = (
    initialNode: ItemNode, DeleteModal: JSX.Element, targetId?: string, onClickDeleteByPage?: (page: IPageForPageDeleteModal) => void,
): JSX.Element => {
  return (
    <div className="grw-pagetree p-3">
      <Item key={initialNode.page.path} targetId={targetId} itemNode={initialNode} isOpen onClickDeleteByPage={onClickDeleteByPage} />
      {DeleteModal}
    </div>
  );
};


/*
 * ItemsTree
 */
const ItemsTree: FC<ItemsTreeProps> = (props: ItemsTreeProps) => {
  const {
    targetPath, targetId, targetAndAncestorsData, isDeleteModalOpen, pagesToDelete, isAbleToDeleteCompletely, isDeleteCompletelyModal, onCloseDelete,
    onClickDeleteByPage,
  } = props;

  const { data: ancestorsChildrenData, error: error1 } = useSWRxPageAncestorsChildren(targetPath);
  const { data: rootPageData, error: error2 } = useSWRxRootPage();

  const DeleteModal = (
    <PageDeleteModal
      isOpen={isDeleteModalOpen}
      pages={pagesToDelete}
      isAbleToDeleteCompletely={isAbleToDeleteCompletely}
      isDeleteCompletelyModal={isDeleteCompletelyModal}
      onClose={onCloseDelete}
    />
  );

  if (error1 != null || error2 != null) {
    // TODO: improve message
    toastError('Error occurred while fetching pages to render PageTree');
    return null;
  }

  /*
   * Render completely
   */
  if (ancestorsChildrenData != null && rootPageData != null) {
    const initialNode = generateInitialNodeAfterResponse(ancestorsChildrenData.ancestorsChildren, new ItemNode(rootPageData.rootPage));
    return renderByInitialNode(initialNode, DeleteModal, targetId, onClickDeleteByPage);
  }

  /*
   * Before swr response comes back
   */
  if (targetAndAncestorsData != null) {
    const initialNode = generateInitialNodeBeforeResponse(targetAndAncestorsData.targetAndAncestors);
    return renderByInitialNode(initialNode, DeleteModal, targetId, onClickDeleteByPage);
  }

  return null;
};


export default ItemsTree;
