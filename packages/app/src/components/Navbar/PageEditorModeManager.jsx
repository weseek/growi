import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';

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
    >
      <span className="d-flex flex-column flex-md-row justify-content-center">
        <span className="grw-page-editor-mode-manager-icon mr-md-1">{icon}</span>
        <span className="grw-page-editor-mode-manager-label">{label}</span>
      </span>
    </button>
  );
});
/* eslint-enable react/prop-types */

function PageEditorModeManager(props) {
  const {
    t, appContainer,
    editorMode, onPageEditorModeButtonClicked, isBtnDisabled, isDeviceSmallerThanMd,
  } = props;

  const isAdmin = appContainer.isAdmin;
  const isHackmdEnabled = appContainer.config.env.HACKMD_URI != null;
  const showHackmdBtn = isHackmdEnabled || isAdmin;
  const showHackmdDisabledTooltip = isAdmin && !isHackmdEnabled && editorMode !== 'hackmd';

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
        className="btn-group grw-page-editor-mode-manager"
        role="group"
        aria-label="page-editor-mode-manager"
        id="grw-page-editor-mode-manager"
      >
        {(!isDeviceSmallerThanMd || editorMode !== 'view') && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            targetMode="view"
            icon={<i className="icon-control-play" />}
            label={t('view')}
          />
        )}
        {(!isDeviceSmallerThanMd || editorMode === 'view') && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            targetMode="edit"
            icon={<i className="icon-note" />}
            label={t('Edit')}
          />
        )}
        {(!isDeviceSmallerThanMd || editorMode === 'view') && showHackmdBtn && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={pageEditorModeButtonClickedHandler}
            targetMode="hackmd"
            icon={<i className="fa fa-file-text-o" />}
            label={t('hackmd.hack_md')}
            id="grw-page-editor-mode-manager-hackmd-button"
          />
        )}
      </div>
      {isBtnDisabled && (
        <UncontrolledTooltip placement="top" target="grw-page-editor-mode-manager" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
      {!isBtnDisabled && showHackmdDisabledTooltip && (
        <UncontrolledTooltip placement="top" target="grw-page-editor-mode-manager-hackmd-button" fade={false}>
          {t('hackmd.not_set_up')}
        </UncontrolledTooltip>
      )}
    </>
  );

}

PageEditorModeManager.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  onPageEditorModeButtonClicked: PropTypes.func,
  isBtnDisabled: PropTypes.bool,
  editorMode: PropTypes.string,
  isDeviceSmallerThanMd: PropTypes.bool,
};

PageEditorModeManager.defaultProps = {
  isBtnDisabled: false,
  isDeviceSmallerThanMd: false,
};

/**
 * Wrapper component for using unstated
 */
const PageEditorModeManagerWrapper = withUnstatedContainers(PageEditorModeManager, [AppContainer]);

export default withTranslation()(PageEditorModeManagerWrapper);
