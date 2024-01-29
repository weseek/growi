import React, { type FC } from 'react';

import {
  SimpleItem, SimpleItemTool, useNewPageInput, type TreeItemProps,
} from '../TreeItem';

type PageTreeItemProps = TreeItemProps & {
  key?: React.Key | null,
};

export const TreeItemForModal: FC<PageTreeItemProps> = (props) => {

  const { isOpen } = props;
  const { Input: NewPageInput, CreateButton: NewPageCreateButton } = useNewPageInput();

  return (
    <SimpleItem
      key={props.key}
      targetPathOrId={props.targetPathOrId}
      itemNode={props.itemNode}
      isOpen={isOpen}
      isEnableActions={props.isEnableActions}
      isReadOnlyUser={props.isReadOnlyUser}
      onRenamed={props.onRenamed}
      onClickDuplicateMenuItem={props.onClickDuplicateMenuItem}
      onClickDeleteMenuItem={props.onClickDeleteMenuItem}
      customNextComponents={[NewPageInput]}
      itemClass={TreeItemForModal}
      customEndComponents={[SimpleItemTool, NewPageCreateButton]}
    />
  );
};
