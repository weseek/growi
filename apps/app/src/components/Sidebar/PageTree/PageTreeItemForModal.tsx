import React, {
  useCallback, useState, FC, ReactNode,
} from 'react';

import nodePath from 'path';

import { pathUtils, pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { useDrag, useDrop } from 'react-dnd';

import { apiv3Put, apiv3Post } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastWarning, toastError, toastSuccess } from '~/client/util/toastr';
import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '~/components/NotAvailableForReadOnlyUser';
import { IPageHasId } from '~/interfaces/page';
import { mutatePageTree, useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';
import loggerFactory from '~/utils/logger';


import ClosableTextInput from '../../Common/ClosableTextInput';

import { ItemNode } from './ItemNode';
// import { SimpleItem, SimpleItemProps } from './SimpleItem';
import { useNewPageInput } from './PageTreeItem';
import SimpleItem, { SimpleItemProps, SimpleItemTool, NotDraggableForClosableTextInput } from './SimpleItem';

const logger = loggerFactory('growi:cli:Item');

type Optional = 'itemRef' | 'itemClass' | 'mainClassName';
type PageTreeItemProps = Omit<SimpleItemProps, Optional> & {key};

export const PageTreeItemForModal = (props) => {

  const { NewPageInput, NewPageCreateButton } = useNewPageInput();

  return (
    <SimpleItem
      key={props.key}
      targetPathOrId={props.targetPathOrId}
      itemNode={props.itemNode}
      isOpen
      isEnableActions={props.isEnableActions}
      isReadOnlyUser={props.isReadOnlyUser}
      onRenamed={props.onRenamed}
      onClickDuplicateMenuItem={props.onClickDuplicateMenuItem}
      onClickDeleteMenuItem={props.onClickDeleteMenuItem}
      customComponentUnderItem={[NewPageInput]}
      itemClass={PageTreeItemForModal}
      customComponent={[SimpleItemTool, NewPageCreateButton]}
    />
  );
};
