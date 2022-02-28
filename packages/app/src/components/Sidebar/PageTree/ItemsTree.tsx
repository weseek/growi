import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePageTreeTermManager, useSWRxPageAncestorsChildren, useSWRxRootPage } from '~/stores/page-listing';
import { TargetAndAncestors } from '~/interfaces/page-listing-results';
import { IPageHasId, IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import { toastError, toastSuccess } from '~/client/util/apiNotification';
import {
  IPageForPageDuplicateModal, usePageDuplicateModal, IPageForPageRenameModal, usePageRenameModal, usePageDeleteModal,
} from '~/stores/modal';
import { smoothScrollIntoView } from '~/client/util/smooth-scroll';

import { useIsEnabledAttachTitleHeader } from '~/stores/context';
import { useFullTextSearchTermManager } from '~/stores/search';
import { useDescendantsPageListForCurrentPathTermManager } from '~/stores/page';

import { ItemNode } from './ItemNode';
import Item from './Item';


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
    isScrolled: boolean,
    targetPathOrId?: string,
    isEnabledAttachTitleHeader?: boolean,
    onClickDuplicateMenuItem?: (pageToDuplicate: IPageForPageDuplicateModal) => void,
    onClickRenameMenuItem?: (pageToRename: IPageForPageRenameModal) => void,
    onClickDeleteMenuItem?: (pageToDelete: IPageToDeleteWithMeta) => void,
): JSX.Element => {

  return (
    <ul className="grw-pagetree list-group p-3">
      <Item
        key={initialNode.page.path}
        targetPathOrId={targetPathOrId}
        itemNode={initialNode}
        isOpen
        isEnabledAttachTitleHeader={isEnabledAttachTitleHeader}
        isEnableActions={isEnableActions}
        onClickDuplicateMenuItem={onClickDuplicateMenuItem}
        onClickRenameMenuItem={onClickRenameMenuItem}
        onClickDeleteMenuItem={onClickDeleteMenuItem}
        isScrolled={isScrolled}
      />
    </ul>
  );
};

// --- Auto scroll related vars and util ---

const SCROLL_OFFSET_TOP = window.innerHeight / 2;

const scrollTargetItem = () => {
  const scrollElement = document.getElementById('grw-sidebar-contents-scroll-target');
  const target = document.getElementById('grw-pagetree-is-target');
  if (scrollElement != null && target != null) {
    smoothScrollIntoView(target, SCROLL_OFFSET_TOP, scrollElement);
  }
};
// --- end ---


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
  const { data: isEnabledAttachTitleHeader } = useIsEnabledAttachTitleHeader();
  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();
  const [isScrolled, setIsScrolled] = useState(false);


  // for mutation
  const { advance: advancePt } = usePageTreeTermManager();
  const { advance: advanceFts } = useFullTextSearchTermManager();
  const { advance: advanceDpl } = useDescendantsPageListForCurrentPathTermManager();

  const scrollItem = () => {
    scrollTargetItem();
    setIsScrolled(true);
  };

  useEffect(() => {
    document.addEventListener('targetItemRendered', scrollItem);
    return () => {
      document.removeEventListener('targetItemRendered', scrollItem);
    };
  }, []);

  const onClickDuplicateMenuItem = (pageToDuplicate: IPageForPageDuplicateModal) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const duplicatedHandler: OnDuplicatedFunction = (fromPath, toPath) => {
      toastSuccess(t('duplicated_pages', { fromPath }));

      advancePt();
      advanceFts();
      advanceDpl();
    };

    openDuplicateModal(pageToDuplicate, { onDuplicated: duplicatedHandler });
  };

  const onClickRenameMenuItem = (pageToRename: IPageForPageRenameModal) => {
    const renamedHandler: OnRenamedFunction = (path) => {
      toastSuccess(t('renamed_pages', { path }));

      // TODO: revalidation by https://redmine.weseek.co.jp/issues/89258
    };

    openRenameModal(pageToRename, { onRenamed: renamedHandler });
  };

  const onClickDeleteMenuItem = (pageToDelete: IPageToDeleteWithMeta) => {
    const onDeletedHandler: OnDeletedFunction = (pathOrPathsToDelete, isRecursively, isCompletely) => {
      if (typeof pathOrPathsToDelete !== 'string') {
        return;
      }

      const path = pathOrPathsToDelete;

      if (isCompletely) {
        toastSuccess(t('deleted_pages_completely', { path }));
      }
      else {
        toastSuccess(t('deleted_pages', { path }));
      }

      advancePt();
      advanceFts();
      advanceDpl();
    };

    openDeleteModal([pageToDelete], { onDeleted: onDeletedHandler });
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
    return renderByInitialNode(
      // eslint-disable-next-line max-len
      initialNode, isEnableActions, isScrolled, targetPathOrId, isEnabledAttachTitleHeader, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
    );
  }

  /*
   * Before swr response comes back
   */
  if (targetAndAncestorsData != null) {
    const initialNode = generateInitialNodeBeforeResponse(targetAndAncestorsData.targetAndAncestors);
    return renderByInitialNode(
      // eslint-disable-next-line max-len
      initialNode, isEnableActions, isScrolled, targetPathOrId, isEnabledAttachTitleHeader, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
    );
  }

  return null;
};

export default ItemsTree;
