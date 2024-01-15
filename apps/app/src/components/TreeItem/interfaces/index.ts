import type { IPageToDeleteWithMeta } from '@growi/core';
import type { Nullable } from 'vitest';

import type { IPageForItem } from '~/interfaces/page';
import type { IPageForPageDuplicateModal } from '~/stores/modal';

import type { ItemNode } from '../ItemNode';

type SimpleItemToolPropsOptional = 'itemNode' | 'targetPathOrId' | 'isOpen' | 'itemRef' | 'itemClass' | 'mainClassName';

export type SimpleItemToolProps = Omit<SimpleItemProps, SimpleItemToolPropsOptional> & {
  page: IPageForItem,
};

export type SimpleItemProps = {
  isEnableActions: boolean
  isReadOnlyUser: boolean
  itemNode: ItemNode
  targetPathOrId?: Nullable<string>
  isOpen?: boolean
  onRenamed?(fromPath: string | undefined, toPath: string): void
  onClickDuplicateMenuItem?(pageToDuplicate: IPageForPageDuplicateModal): void
  onClickDeleteMenuItem?(pageToDelete: IPageToDeleteWithMeta): void
  itemRef?
  itemClass?: React.FunctionComponent<SimpleItemProps>
  mainClassName?: string
  customEndComponents?: Array<React.FunctionComponent<SimpleItemToolProps>>
  customNextComponents?: Array<React.FunctionComponent<SimpleItemToolProps>>
};

export type SimpleItemContentProps = SimpleItemToolProps & {
  page: IPageForItem,
  children: ItemNode[],
  stateHandlers: {
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  },
};
