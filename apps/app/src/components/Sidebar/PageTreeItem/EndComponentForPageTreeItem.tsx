import type { FC } from 'react';
import React, {
  useCallback, useState,
} from 'react';

import nodePath from 'path';

import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastError, toastSuccess } from '~/client/util/toastr';

import ClosableTextInput from '../../Common/ClosableTextInput';
import type { TreeItemToolProps } from '../../TreeItem';
import {
  NotDraggableForClosableTextInput, SimpleItemTool,
  SimpleItemContent,
} from '../../TreeItem';

import { Ellipsis } from './Ellipsis';

export const generateEndComponentForPageTreeItem = (EndComponents?: FC[]) => {
  return (props: TreeItemToolProps): React.JSX.Element => {

    const [isRenameInputShown, setRenameInputShown] = useState(false);
    const { t } = useTranslation();

    const {
      itemNode, onRenamed, onClickDuplicateMenuItem,
      onClickDeleteMenuItem, isEnableActions, isReadOnlyUser,
    } = props;

    const { page } = itemNode;

    const renameMenuItemClickHandler = useCallback(() => {
      setRenameInputShown(true);
    }, []);

    const cancel = useCallback(() => {
      setRenameInputShown(false);
    }, []);

    const rename = useCallback(async(inputText) => {
      if (inputText.trim() === '') {
        return cancel();
      }

      const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(page.path ?? ''));
      const newPagePath = nodePath.resolve(parentPath, inputText);

      if (newPagePath === page.path) {
        setRenameInputShown(false);
        return;
      }

      try {
        setRenameInputShown(false);
        await apiv3Put('/pages/rename', {
          pageId: page._id,
          revisionId: page.revision,
          newPagePath,
        });

        onRenamed?.(page.path, newPagePath);

        toastSuccess(t('renamed_pages', { path: page.path }));
      }
      catch (err) {
        setRenameInputShown(true);
        toastError(err);
      }
    }, [cancel, onRenamed, page._id, page.path, page.revision, t]);

    const hasChildren = page.descendantCount ? page.descendantCount > 0 : false;

    return (
      <>
        {isRenameInputShown ? (
          <div className={`position-absolute ${hasChildren ? 'ms-5' : 'ms-4'}`}>
            <NotDraggableForClosableTextInput>
              <ClosableTextInput
                value={nodePath.basename(page.path ?? '')}
                placeholder={t('Input page name')}
                onPressEnter={rename}
                onBlur={rename}
                onPressEscape={cancel}
                validationTarget={ValidationTarget.PAGE}
              />
            </NotDraggableForClosableTextInput>
          </div>
        ) : (
          <>
            <SimpleItemContent itemNode={itemNode} />
            <SimpleItemTool itemNode={itemNode} isEnableActions={false} isReadOnlyUser={false} />
            <Ellipsis
              itemNode={itemNode}
              onRenamed={onRenamed}
              onClickDeleteMenuItem={onClickDeleteMenuItem}
              onClickDuplicateMenuItem={onClickDuplicateMenuItem}
              isEnableActions={isEnableActions}
              isReadOnlyUser={isReadOnlyUser}
              renameMenuItemClickHandler={renameMenuItemClickHandler}
            />
            {EndComponents?.map((EndComponent, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <EndComponent key={index} {...props} />
            ))}
          </>
        )}
      </>
    );
  };

};
