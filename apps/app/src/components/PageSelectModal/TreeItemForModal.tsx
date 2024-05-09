import type { FC } from 'react';

import {
  TreeItemLayout, useNewPageInput, type TreeItemProps,
} from '../TreeItem';


type PageTreeItemProps = TreeItemProps & {
  key?: React.Key | null,
};

export const TreeItemForModal: FC<PageTreeItemProps> = (props) => {

  const { isOpen, onClick } = props;

  const { Input: NewPageInput, CreateButton: NewPageCreateButton } = useNewPageInput();

  return (
    <TreeItemLayout
      key={props.key}
      targetPathOrId={props.targetPathOrId}
      itemLevel={props.itemLevel}
      itemNode={props.itemNode}
      isOpen={isOpen}
      isEnableActions={props.isEnableActions}
      isReadOnlyUser={props.isReadOnlyUser}
      onClickDuplicateMenuItem={props.onClickDuplicateMenuItem}
      onClickDeleteMenuItem={props.onClickDeleteMenuItem}
      onRenamed={props.onRenamed}
      customHeadOfChildrenComponents={[NewPageInput]}
      itemClass={TreeItemForModal}
      customHoveredEndComponents={[NewPageCreateButton]}
      onClick={onClick}
    />
  );
};
