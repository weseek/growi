import type { IPageToDeleteWithMeta } from '@growi/core';
import type { Nullable } from 'vitest';

import type { IPageForPageDuplicateModal } from '~/stores/modal';

import type { ItemNode } from '../ItemNode';

type TreeItemBaseProps = {
  itemNode: ItemNode,
  isEnableActions: boolean,
  isReadOnlyUser: boolean,
  onRenamed?(fromPath: string | undefined, toPath: string): void,
  onClickDuplicateMenuItem?(pageToDuplicate: IPageForPageDuplicateModal): void,
  onClickDeleteMenuItem?(pageToDelete: IPageToDeleteWithMeta): void,
  stateHandlers?: {
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  },
}

export type TreeItemToolProps = TreeItemBaseProps;

export type TreeItemProps = TreeItemBaseProps & {
  targetPathOrId?: Nullable<string>,
  isOpen?: boolean,
  itemClass?: React.FunctionComponent<TreeItemProps>,
  mainClassName?: string,
  customEndComponents?: Array<React.FunctionComponent<TreeItemToolProps>>,
  customNextComponents?: Array<React.FunctionComponent<TreeItemToolProps>>,
};
