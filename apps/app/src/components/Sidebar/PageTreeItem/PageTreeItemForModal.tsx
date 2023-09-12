import React, { FC } from 'react';

import SimpleItem, { SimpleItemProps, SimpleItemTool } from '../../TreeItem/SimpleItem';

import { useNewPageInput } from './PageTreeItem';

type Optional = 'itemRef' | 'itemClass' | 'mainClassName';
type PageTreeItemProps = Omit<SimpleItemProps, Optional> & {key};

export const PageTreeItemForModal: FC<PageTreeItemProps> = (props) => {

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
      customNextComponents={[NewPageInput]}
      itemClass={PageTreeItemForModal}
      customEndComponents={[SimpleItemTool, NewPageCreateButton]}
    />
  );
};
