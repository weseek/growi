import React, { type ReactNode, useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { EditorMode, useIsDeviceSmallerThanMd } from '~/stores/ui';

import styles from './PageEditorModeManager.module.scss';


type PageEditorModeButtonProps = {
  currentEditorMode: EditorMode,
  editorMode: EditorMode,
  icon: ReactNode,
  label: ReactNode,
  isBtnDisabled?: boolean,
  onClick?: (mode: EditorMode) => void,
}
const PageEditorModeButton = React.memo((props: PageEditorModeButtonProps) => {
  const {
    currentEditorMode, isBtnDisabled, editorMode, icon, label, onClick,
  } = props;

  const classNames = ['btn btn-outline-primary px-1'];
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
      <span className="me-1">{icon}</span>
      <span>{label}</span>
    </button>
  );
});

type Props = {
  editorMode: EditorMode | undefined,
  isBtnDisabled?: boolean,
  onPageEditorModeButtonClicked?: (editorMode: EditorMode) => Promise<void>,
}

export const PageEditorModeManager = (props: Props): JSX.Element => {
  const {
    editorMode = EditorMode.View,
    isBtnDisabled,
    onPageEditorModeButtonClicked,
  } = props;

  const { t } = useTranslation();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();

  const pageEditorModeButtonClickedHandler = useCallback((viewType: EditorMode) => {
    if (isBtnDisabled) {
      return;
    }

    onPageEditorModeButtonClicked?.(viewType);
  }, [isBtnDisabled, onPageEditorModeButtonClicked]);

  return (
    <>
      <div
        className={`btn-group grw-page-editor-mode-manager ${styles['grw-page-editor-mode-manager']}`}
        role="group"
        aria-label="page-editor-mode-manager"
        id="grw-page-editor-mode-manager"
      >
        {(!isDeviceSmallerThanMd || editorMode !== EditorMode.View) && (
          <PageEditorModeButton
            currentEditorMode={editorMode}
            editorMode={EditorMode.View}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            icon={<i className="icon-control-play" />}
            label={t('view')}
          />
        )}
        {(!isDeviceSmallerThanMd || editorMode === EditorMode.View) && (
          <PageEditorModeButton
            currentEditorMode={editorMode}
            editorMode={EditorMode.Editor}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            icon={<i className="icon-note" />}
            label={t('Edit')}
          />
        )}
      </div>
    </>
  );

};
