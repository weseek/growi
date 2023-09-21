import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import { EditorMode, useIsDeviceSmallerThanMd } from '~/stores/ui';

import styles from './PageEditorModeManager.module.scss';

/* eslint-disable react/prop-types */
const PageEditorModeButtonWrapper = React.memo(({
  editorMode, isBtnDisabled, onClick, targetMode, icon, label, id,
}) => {
  const classNames = [`btn btn-outline-primary ${targetMode}-button px-1`];
  if (editorMode === targetMode) {
    classNames.push('active');
  }
  if (isBtnDisabled) {
    classNames.push('disabled');
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      onClick={() => { onClick(targetMode) }}
      id={id}
      data-testid={`${targetMode}-button`}
    >
      <span className="d-flex flex-column flex-md-row justify-content-center">
        <span className="grw-page-editor-mode-manager-icon me-md-1">{icon}</span>
        <span className="grw-page-editor-mode-manager-label">{label}</span>
      </span>
    </button>
  );
});
/* eslint-enable react/prop-types */

PageEditorModeButtonWrapper.displayName = 'PageEditorModeButtonWrapper';

function PageEditorModeManager(props) {
  const {
    editorMode, onPageEditorModeButtonClicked, isBtnDisabled,
  } = props;

  const { t } = useTranslation();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();

  const pageEditorModeButtonClickedHandler = useCallback((viewType) => {
    if (isBtnDisabled) {
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
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            targetMode={EditorMode.View}
            icon={<i className="icon-control-play" />}
            label={t('view')}
          />
        )}
        {(!isDeviceSmallerThanMd || editorMode === EditorMode.View) && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            targetMode={EditorMode.Editor}
            icon={<i className="icon-note" />}
            label={t('Edit')}
          />
        )}
      </div>
    </>
  );

}

PageEditorModeManager.propTypes = {
  onPageEditorModeButtonClicked: PropTypes.func,
  isBtnDisabled: PropTypes.bool,
  editorMode: PropTypes.string,
};

PageEditorModeManager.defaultProps = {
  isBtnDisabled: false,
};

export default PageEditorModeManager;
