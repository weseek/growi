import React, { FC } from 'react';

import {
  SimpleItem, SimpleItemProps, SimpleItemTool, useNewPageInput,
} from '../TreeItem';

type Optional = 'itemRef' | 'itemClass' | 'mainClassName';
type PageTreeItemProps = Omit<SimpleItemProps, Optional> & {key};

export const PageTreeItemForModal: FC<PageTreeItemProps> = (props) => {

  const { NewPageInputWrapper, NewPageCreateButtonWrapper } = useNewPageInput();

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
      customNextComponents={[NewPageInputWrapper]}
      itemClass={PageTreeItemForModal}
      customEndComponents={[SimpleItemTool, NewPageCreateButtonWrapper]}
    />
  );
};
