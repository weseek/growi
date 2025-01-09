import React, {
  useEffect, useMemo, useCallback,
} from 'react';

import path from 'path';

import type { IPageHasId, IPageToDeleteWithMeta } from '@growi/core';
import { useGlobalSocket } from '@growi/core/dist/swr';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { toastError, toastSuccess } from '~/client/util/toastr';
import type { IPageForItem } from '~/interfaces/page';
import type { AncestorsChildrenResult, RootPageResult, TargetAndAncestors } from '~/interfaces/page-listing-results';
import type { OnDuplicatedFunction, OnDeletedFunction } from '~/interfaces/ui';
import type { UpdateDescCountData, UpdateDescCountRawData } from '~/interfaces/websocket';
import { SocketEventName } from '~/interfaces/websocket';
import type { IPageForPageDuplicateModal } from '~/stores/modal';
import { usePageDuplicateModal, usePageDeleteModal } from '~/stores/modal';
import { mutateAllPageInfo, useCurrentPagePath, useSWRMUTxCurrentPage } from '~/stores/page';
import {
  useSWRxPageAncestorsChildren, useSWRxRootPage, mutatePageTree, mutatePageList,
} from '~/stores/page-listing';
import { mutateSearching } from '~/stores/search';
import { usePageTreeDescCountMap } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import { ItemNode, type TreeItemProps } from '../TreeItem';

import ItemsTreeContentSkeleton from './ItemsTreeContentSkeleton';

import styles from './ItemsTree.module.scss';

const moduleClass = styles['items-tree'] ?? '';

const logger = loggerFactory('growi:cli:ItemsTree');

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

// user defined typeguard to assert the arg is not null
type RenderingCondition = {
  ancestorsChildrenResult: AncestorsChildrenResult | undefined,
  rootPageResult: RootPageResult | undefined,
}
type SecondStageRenderingCondition = {
  ancestorsChildrenResult: AncestorsChildrenResult,
  rootPageResult: RootPageResult,
}
const isSecondStageRenderingCondition = (condition: RenderingCondition|SecondStageRenderingCondition): condition is SecondStageRenderingCondition => {
  return condition.ancestorsChildrenResult != null && condition.rootPageResult != null;
};


type ItemsTreeProps = {
  isEnableActions: boolean
  isReadOnlyUser: boolean
  isWipPageShown?: boolean
  targetPath: string
  targetPathOrId?: string,
  targetAndAncestorsData?: TargetAndAncestors
  CustomTreeItem: React.FunctionComponent<TreeItemProps>
  onClickTreeItem?: (page: IPageForItem) => void;
}

/*
 * ItemsTree
 */
export const ItemsTree = (props: ItemsTreeProps): JSX.Element => {
  const {
    targetPath, targetPathOrId, targetAndAncestorsData, isEnableActions, isReadOnlyUser, isWipPageShown, CustomTreeItem, onClickTreeItem,
  } = props;

  const { t } = useTranslation();
  const router = useRouter();

  const { data: ancestorsChildrenResult, error: error1 } = useSWRxPageAncestorsChildren(targetPath, { suspense: true });
  const { data: rootPageResult, error: error2 } = useSWRxRootPage({ suspense: true });
  const { data: currentPagePath } = useCurrentPagePath();
  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openDeleteModal } = usePageDeleteModal();

  const { data: socket } = useGlobalSocket();
  const { data: ptDescCountMap, update: updatePtDescCountMap } = usePageTreeDescCountMap();

  // for mutation
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();


  const renderingCondition = useMemo(() => {
    return {
      ancestorsChildrenResult,
      rootPageResult,
    };
  }, [ancestorsChildrenResult, rootPageResult]);

  useEffect(() => {
    if (socket == null) {
      return;
    }

    socket.on(SocketEventName.UpdateDescCount, (data: UpdateDescCountRawData) => {
      // save to global state
      const newData: UpdateDescCountData = new Map(Object.entries(data));

      updatePtDescCountMap(newData);
    });

    return () => { socket.off(SocketEventName.UpdateDescCount) };

  }, [socket, ptDescCountMap, updatePtDescCountMap]);

  const onRenamed = useCallback((fromPath: string | undefined, toPath: string) => {
    mutatePageTree();
    mutateSearching();
    mutatePageList();

    if (currentPagePath === fromPath || currentPagePath === toPath) {
      mutateCurrentPage();
    }
  }, [currentPagePath, mutateCurrentPage]);

  const onClickDuplicateMenuItem = useCallback((pageToDuplicate: IPageForPageDuplicateModal) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const duplicatedHandler: OnDuplicatedFunction = (fromPath, toPath) => {
      toastSuccess(t('duplicated_pages', { fromPath }));

      mutatePageTree();
      mutateSearching();
      mutatePageList();
    };

    openDuplicateModal(pageToDuplicate, { onDuplicated: duplicatedHandler });
  }, [openDuplicateModal, t]);

  const onClickDeleteMenuItem = useCallback((pageToDelete: IPageToDeleteWithMeta) => {
    const onDeletedHandler: OnDeletedFunction = (pathOrPathsToDelete, isRecursively, isCompletely) => {
      if (typeof pathOrPathsToDelete !== 'string') {
        return;
      }

      if (isCompletely) {
        toastSuccess(t('deleted_pages_completely', { path: pathOrPathsToDelete }));
      }
      else {
        toastSuccess(t('deleted_pages', { path: pathOrPathsToDelete }));
      }

      mutatePageTree();
      mutateSearching();
      mutatePageList();
      mutateAllPageInfo();

      if (currentPagePath === pathOrPathsToDelete) {
        mutateCurrentPage();
        router.push(isCompletely ? path.dirname(pathOrPathsToDelete) : `/trash${pathOrPathsToDelete}`);
      }
    };

    openDeleteModal([pageToDelete], { onDeleted: onDeletedHandler });
  }, [currentPagePath, mutateCurrentPage, openDeleteModal, router, t]);


  if (error1 != null || error2 != null) {
    // TODO: improve message
    toastError('Error occurred while fetching pages to render PageTree');
    return <></>;
  }

  let initialItemNode;
  /*
   * Render second stage
   */
  if (isSecondStageRenderingCondition(renderingCondition)) {
    initialItemNode = generateInitialNodeAfterResponse(
      renderingCondition.ancestorsChildrenResult.ancestorsChildren,
      new ItemNode(renderingCondition.rootPageResult.rootPage),
    );
  }
  /*
   * Before swr response comes back
   */
  else if (targetAndAncestorsData != null) {
    initialItemNode = generateInitialNodeBeforeResponse(targetAndAncestorsData.targetAndAncestors);
  }

  if (initialItemNode != null) {
    return (
      <ul className={`${moduleClass} list-group`}>
        <CustomTreeItem
          key={initialItemNode.page.path}
          targetPath={targetPath}
          targetPathOrId={targetPathOrId}
          itemNode={initialItemNode}
          isOpen
          isEnableActions={isEnableActions}
          isWipPageShown={isWipPageShown}
          isReadOnlyUser={isReadOnlyUser}
          onRenamed={onRenamed}
          onClickDuplicateMenuItem={onClickDuplicateMenuItem}
          onClickDeleteMenuItem={onClickDeleteMenuItem}
          onClick={onClickTreeItem}
        />
      </ul>
    );
  }

  return <ItemsTreeContentSkeleton />;
};
