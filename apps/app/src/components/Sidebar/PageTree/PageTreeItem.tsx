import React, { useCallback, useState } from 'react';

import nodePath from 'path';

import { pagePathUtils } from '@growi/core';
import { useDrag, useDrop } from 'react-dnd';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastWarning, toastError } from '~/client/util/toastr';
import { IPageHasId } from '~/interfaces/page';
import { mutatePageTree } from '~/stores/page-listing';
import loggerFactory from '~/utils/logger';

import { ItemNode } from './ItemNode';


const logger = loggerFactory('growi:cli:Item');


export const CreatePageTreeItem = (SimpleItem) => {
  const settings = '';

  return function usePageTreeItem(props) {
    const [shouldHide, setShouldHide] = useState(false);

    const {
      itemNode, targetPathOrId, isOpen: _isOpen = false,
      onRenamed, onClickDuplicateMenuItem, onClickDeleteMenuItem, isEnableActions, isReadOnlyUser,
    } = props;

    const { page, children } = itemNode;

    const [, drag] = useDrag({
      type: 'PAGE_TREE',
      item: { page },
      canDrag: () => {
        if (page.path == null) {
          return false;
        }
        return !pagePathUtils.isUsersProtectedPages(page.path);
      },
      end: (item, monitor) => {
        // in order to set d-none to dropped Item
        const dropResult = monitor.getDropResult();
        if (dropResult != null) {
          setShouldHide(true);
        }
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
        canDrag: monitor.canDrag(),
      }),
    });

    return (
      <div className={shouldHide ? 'd-none' : ''}>
        <SimpleItem/>
      </div>
    );
  };
};
