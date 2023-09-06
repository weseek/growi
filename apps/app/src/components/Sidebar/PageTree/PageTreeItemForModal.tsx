import React, { FC } from 'react';

import { useNewPageInput } from './PageTreeItem';
import SimpleItem, { SimpleItemProps, SimpleItemTool } from './SimpleItem';

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
      customComponentUnderItem={[NewPageInput]}
      itemClass={PageTreeItemForModal}
      customComponent={[SimpleItemTool, NewPageCreateButton]}
    />
  );
};
