import React, { type ReactNode, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

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

  const classNames = [`btn btn-outline-primary ${editorMode}-button px-1`];
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
      <span className="d-flex flex-column flex-md-row justify-content-center">
        <span className="grw-page-editor-mode-manager-icon me-md-1">{icon}</span>
        <span className="grw-page-editor-mode-manager-label">{label}</span>
      </span>
    </button>
  );
});

type Props = {
  editorMode: EditorMode | undefined,
  onPageEditorModeButtonClicked?: (editorMode: EditorMode) => void,
  isBtnDisabled?: boolean,
}

export const PageEditorModeManager = (props: Props): JSX.Element => {
  const {
    editorMode = EditorMode.View,
    isBtnDisabled,
    onPageEditorModeButtonClicked,
  } = props;

  const { t } = useTranslation();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();

  const pageEditorModeButtonClickedHandler = useCallback((viewType) => {
    if (isBtnDisabled ?? false) {
      return;
    }
    if (onPageEditorModeButtonClicked != null) {
      onPageEditorModeButtonClicked(viewType);
    }
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
