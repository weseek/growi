import React, { FC } from 'react';

import { IPageHasId } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageAncestorsChildren, useSWRxRootPage } from '../../../stores/page-listing';
import { TargetAndAncestors } from '~/interfaces/page-listing-results';
import { toastError } from '~/client/util/apiNotification';
import PageDeleteModal, { IPageForPageDeleteModal } from '~/components/PageDeleteModal';
import PageDuplicateModal from '~/components/PageDuplicateModal';

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
  paths.every((path) => {
    // stop rendering when non-migrated pages found
    if (currentNode == null) {
      return false;
    }

    const childPages = ancestorsChildren[path];
    currentNode.children = ItemNode.generateNodesFromPages(childPages);
    const nextNode = currentNode.children.filter((node) => {
      return paths.includes(node.page.path as string);
    })[0];
    currentNode = nextNode;
    return true;
  });

  return rootNode;
};

type ItemsTreeProps = {
  isEnableActions: boolean
  targetPath: string
  targetPathOrId?: string
  targetAndAncestorsData?: TargetAndAncestors

  // for duplicateModal
  isPageDuplicateModalShown: boolean
  pagesToDuplicate: any[] // need to declear IPageForPageDeleteModal
  onClosePageDuplicateModal(): void
  onClickPageDuplicateModal(page): void
  pageIdToDuplicate
  pagePathToDuplicate
  // for deleteModal
  isDeleteModalOpen: boolean
  pagesToDelete: IPageForPageDeleteModal[]
  isAbleToDeleteCompletely: boolean
  isDeleteCompletelyModal: boolean
  onCloseDelete(): void
  onClickDeleteByPage(page: IPageForPageDeleteModal): void
}

const renderByInitialNode = (
    // eslint-disable-next-line max-len
    initialNode: ItemNode,
    DuplicateModal: JSX.Element,
    DeleteModal: JSX.Element,
    isEnableActions: boolean,
    targetPathOrId?: string,
    openPageDuplicateModalHandler?: (page) => void,
    onClickDeleteByPage?: (page: IPageForPageDeleteModal) => void,
): JSX.Element => {
  return (
    <ul className="grw-pagetree list-group p-3">
      <Item
        key={initialNode.page.path}
        targetPathOrId={targetPathOrId}
        itemNode={initialNode}
        isOpen
        isEnableActions={isEnableActions}
        onClickDuplecatePage={openPageDuplicateModalHandler}
        onClickDeleteByPage={onClickDeleteByPage}
      />
      {DeleteModal}
      {DuplicateModal}
    </ul>
  );
};


/*
 * ItemsTree
 */
const ItemsTree: FC<ItemsTreeProps> = (props: ItemsTreeProps) => {
  const {
    targetPath, targetPathOrId, targetAndAncestorsData, isDeleteModalOpen, pagesToDelete, isAbleToDeleteCompletely, isDeleteCompletelyModal, onCloseDelete,
    isPageDuplicateModalShown, onClosePageDuplicateModal, pageIdToDuplicate, pagePathToDuplicate,
    onClickPageDuplicateModal, onClickDeleteByPage, isEnableActions,
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

  const DuplicateModal = (
    <PageDuplicateModal
      isOpen={isPageDuplicateModalShown}
      onClose={onClosePageDuplicateModal}
      pageId={pageIdToDuplicate}
      path={pagePathToDuplicate}
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
    return renderByInitialNode(initialNode, DuplicateModal, DeleteModal, isEnableActions, targetPathOrId, onClickPageDuplicateModal, onClickDeleteByPage);
  }

  /*
   * Before swr response comes back
   */
  if (targetAndAncestorsData != null) {
    const initialNode = generateInitialNodeBeforeResponse(targetAndAncestorsData.targetAndAncestors);
    return renderByInitialNode(initialNode, DuplicateModal, DeleteModal, isEnableActions, targetPathOrId, onClickPageDuplicateModal, onClickDeleteByPage);
  }

  return null;
};


export default ItemsTree;
