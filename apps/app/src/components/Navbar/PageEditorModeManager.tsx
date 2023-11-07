import React, { type ReactNode, useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { EditorMode, useIsDeviceLargerThanMd } from '~/stores/ui';

import { useOnPageEditorModeButtonClicked } from './hooks';

import styles from './PageEditorModeManager.module.scss';


type PageEditorModeButtonProps = {
  currentEditorMode: EditorMode,
  editorMode: EditorMode,
  children?: ReactNode,
  isBtnDisabled?: boolean,
  onClick?: (mode: EditorMode) => void,
}
const PageEditorModeButton = React.memo((props: PageEditorModeButtonProps) => {
  const {
    currentEditorMode, isBtnDisabled, editorMode, children, onClick,
  } = props;

  const classNames = ['btn btn-outline-primary py-1 px-2 d-flex align-items-center justify-content-center'];
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
      onClick={() => onClick?.(editorMode)}
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
  grantUserGroupId?: string
}

export const PageEditorModeManager = (props: Props): JSX.Element => {
  const {
    editorMode = EditorMode.View,
    isBtnDisabled,
    path,
    grant,
    grantUserGroupId,
  } = props;

  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);

  const { data: isDeviceLargerThanMd } = useIsDeviceLargerThanMd();

  const onPageEditorModeButtonClicked = useOnPageEditorModeButtonClicked(setIsCreating, path, grant, grantUserGroupId);
  const _isBtnDisabled = isCreating || isBtnDisabled;

  const pageEditorModeButtonClickedHandler = useCallback((viewType: EditorMode) => {
    if (_isBtnDisabled) {
      return;
    }

    onPageEditorModeButtonClicked?.(viewType);
  }, [_isBtnDisabled, onPageEditorModeButtonClicked]);

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
            onClick={pageEditorModeButtonClickedHandler}
          >
            <span className="material-symbols-outlined fs-4">play_arrow</span>{t('View')}
          </PageEditorModeButton>
        )}
        {(isDeviceLargerThanMd || editorMode === EditorMode.View) && (
          <PageEditorModeButton
            currentEditorMode={editorMode}
            editorMode={EditorMode.Editor}
            isBtnDisabled={_isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
          >
            <span className="material-symbols-outlined me-1 fs-5">edit_square</span>{t('Edit')}
          </PageEditorModeButton>
        )}
      </div>
    </>
  );

};
