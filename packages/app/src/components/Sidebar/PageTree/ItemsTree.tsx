import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { IPageHasId } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageAncestorsChildren, useSWRxRootPage } from '../../../stores/page-listing';
import { TargetAndAncestors } from '~/interfaces/page-listing-results';
import { toastError, toastSuccess } from '~/client/util/apiNotification';
import {
  OnDeletedFunction, IPageForPageDeleteModal, usePageDuplicateModal, usePageRenameModal, usePageDeleteModal,
} from '~/stores/modal';
import { smoothScrollIntoView } from '~/client/util/smooth-scroll';

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
}

const renderByInitialNode = (
    initialNode: ItemNode,
    isEnableActions: boolean,
    targetPathOrId?: string,
    onClickDuplicateMenuItem?: (pageId: string, path: string) => void,
    onClickRenameMenuItem?: (pageId: string, revisionId: string, path: string) => void,
    onClickDeleteMenuItem?: (pageToDelete: IPageForPageDeleteModal | null) => void,
): JSX.Element => {

  return (
    <ul className="grw-pagetree list-group p-3">
      <Item
        key={initialNode.page.path}
        targetPathOrId={targetPathOrId}
        itemNode={initialNode}
        isOpen
        isEnableActions={isEnableActions}
        onClickDuplicateMenuItem={onClickDuplicateMenuItem}
        onClickRenameMenuItem={onClickRenameMenuItem}
        onClickDeleteMenuItem={onClickDeleteMenuItem}
      />
    </ul>
  );
};


/*
 * ItemsTree
 */
const ItemsTree: FC<ItemsTreeProps> = (props: ItemsTreeProps) => {
  const {
    targetPath, targetPathOrId, targetAndAncestorsData, isEnableActions,
  } = props;

  const { t } = useTranslation();

  const { data: ancestorsChildrenData, error: error1 } = useSWRxPageAncestorsChildren(targetPath);
  const { data: rootPageData, error: error2 } = useSWRxRootPage();
  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { data: deleteModalData, open: openDeleteModal } = usePageDeleteModal();
  console.log('deleteModalData_ItemsTree', deleteModalData);

  useEffect(() => {
    const startFrom = document.getElementById('grw-sidebar-contents-scroll-target');
    const targetElem = document.getElementsByClassName('grw-pagetree-is-target');
    //  targetElem is HTML collection but only one HTML element in it all the time
    if (targetElem[0] != null && startFrom != null) {
      smoothScrollIntoView(targetElem[0] as HTMLElement, 0, startFrom);
    }
  }, [ancestorsChildrenData]);

  const onClickDuplicateMenuItem = (pageId: string, path: string) => {
    openDuplicateModal(pageId, path);
  };

  const onClickRenameMenuItem = (pageId: string, revisionId: string, path: string) => {
    openRenameModal(pageId, revisionId, path);
  };


  const onClickDeleteMenuItem = (pageToDelete: IPageForPageDeleteModal) => {
    openDeleteModal([pageToDelete], true);
  };

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
    return renderByInitialNode(initialNode, isEnableActions, targetPathOrId, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem);
  }

  /*
   * Before swr response comes back
   */
  if (targetAndAncestorsData != null) {
    const initialNode = generateInitialNodeBeforeResponse(targetAndAncestorsData.targetAndAncestors);
    return renderByInitialNode(initialNode, isEnableActions, targetPathOrId, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem);
  }

  return null;
};

export default ItemsTree;
