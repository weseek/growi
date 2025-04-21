import type { FC, Key } from 'react';

import { TreeItemLayout, useNewPageInput, type TreeItemProps } from '../TreeItem';

import styles from './TreeItemForModal.module.scss';

const moduleClass = styles['tree-item-for-modal'];

type TreeItemForModalProps = TreeItemProps & {
  key?: Key | null;
};

export const TreeItemForModal: FC<TreeItemForModalProps> = (props) => {
  const { itemNode, targetPathOrId } = props;
  const { page } = itemNode;

  const { Input: NewPageInput, CreateButton: NewPageCreateButton } = useNewPageInput();

  const isSelected = page._id === targetPathOrId || page.path === targetPathOrId;

  const itemClassNames = [isSelected ? 'active' : ''];

  return (
    <TreeItemLayout
      {...props}
      className={moduleClass}
      itemClass={TreeItemForModal}
      itemClassName={itemClassNames.join(' ')}
      customHeadOfChildrenComponents={[NewPageInput]}
      customHoveredEndComponents={[NewPageCreateButton]}
    />
  );
};
