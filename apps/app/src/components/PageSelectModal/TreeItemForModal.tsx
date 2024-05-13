import type { FC } from 'react';

import type { Nullable } from '@growi/core';

import type { ItemNode } from '../TreeItem';
import {
  TreeItemLayout, useNewPageInput, type TreeItemProps,
} from '../TreeItem';


import styles from './TreeItemForModal.module.scss';

const moduleClass = styles['tree-item-for-modal'];


type PageTreeItemProps = TreeItemProps & {
  key?: React.Key | null,
};

export const TreeItemForModal: FC<PageTreeItemProps> = (props) => {

  const { isOpen, onClick } = props;

  const { Input: NewPageInput, CreateButton: NewPageCreateButton } = useNewPageInput();

  return (
    <TreeItemLayout
      key={props.key}
      className={moduleClass}
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
      // markTarget={markTarget}
    />
  );
};
