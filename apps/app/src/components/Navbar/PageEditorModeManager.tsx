import React, { type ReactNode, useCallback, useState } from 'react';

import type { IGrantedGroup } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { toastError } from '~/client/util/toastr';
import { EditorMode, useEditorMode, useIsDeviceLargerThanMd } from '~/stores/ui';

import { useCreatePageAndTransit } from '../../client/services/use-create-page-and-transit';

import styles from './PageEditorModeManager.module.scss';


type PageEditorModeButtonProps = {
  currentEditorMode: EditorMode,
  editorMode: EditorMode,
  children?: ReactNode,
  isBtnDisabled?: boolean,
  onClick?: () => void,
}
const PageEditorModeButton = React.memo((props: PageEditorModeButtonProps) => {
  const {
    currentEditorMode, isBtnDisabled, editorMode, children, onClick,
  } = props;

  const classNames = ['btn py-1 px-2 d-flex align-items-center justify-content-center'];
  if (currentEditorMode === editorMode) {
    classNames.push('active');
  }
  if (isBtnDisabled) {
    classNames.push('disabled');
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      onClick={onClick}
      data-testid={`${editorMode}-button`}
    >
      {children}
    </button>
  );
});

type Props = {
  editorMode: EditorMode | undefined,
  isBtnDisabled: boolean,
  path?: string,
  grant?: number,
  // grantUserGroupId?: string
  grantUserGroupIds?: IGrantedGroup[]
}

export const PageEditorModeManager = (props: Props): JSX.Element => {
  const {
    editorMode = EditorMode.View,
    isBtnDisabled,
    path,
    // grant,
    // grantUserGroupId,
  } = props;

  const { t } = useTranslation('common');
  const [isCreating, setIsCreating] = useState(false);

  const { mutate: mutateEditorMode } = useEditorMode();
  const { data: isDeviceLargerThanMd } = useIsDeviceLargerThanMd();

  const _isBtnDisabled = isCreating || isBtnDisabled;

  const createPageAndTransit = useCreatePageAndTransit();

  const editButtonClickedHandler = useCallback(() => {
    createPageAndTransit(
      path,
      {
        onCreationStart: () => { setIsCreating(true) },
        onError: () => { toastError(t('toaster.create_failed', { target: path })) },
        onTerminated: () => { setIsCreating(false) },
      },
    );
  }, [createPageAndTransit, path, t]);

  return (
    <>
      <div
        className={`btn-group grw-page-editor-mode-manager ${styles['grw-page-editor-mode-manager']}`}
        role="group"
        aria-label="page-editor-mode-manager"
        id="grw-page-editor-mode-manager"
      >
        {(isDeviceLargerThanMd || editorMode !== EditorMode.View) && (
          <PageEditorModeButton
            currentEditorMode={editorMode}
            editorMode={EditorMode.View}
            isBtnDisabled={_isBtnDisabled}
            onClick={() => mutateEditorMode(EditorMode.View)}
          >
            <span className="material-symbols-outlined fs-4">play_arrow</span>{t('View')}
          </PageEditorModeButton>
        )}
        {(isDeviceLargerThanMd || editorMode === EditorMode.View) && (
          <PageEditorModeButton
            currentEditorMode={editorMode}
            editorMode={EditorMode.Editor}
            isBtnDisabled={_isBtnDisabled}
            onClick={editButtonClickedHandler}
          >
            <span className="material-symbols-outlined me-1 fs-5">edit_square</span>{t('Edit')}
          </PageEditorModeButton>
        )}
      </div>
    </>
  );

};
