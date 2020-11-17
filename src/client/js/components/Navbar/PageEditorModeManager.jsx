import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

/* eslint-disable react/prop-types */
const PageEditorModeButtonWrapper = React.memo(({
  editorMode, isBtnDisabled, onClick, targetMode, children,
}) => {
  const classNames = [`btn btn-outline-primary ${targetMode}-button`];
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
    >
      {children}
    </button>
  );
});
/* eslint-enable react/prop-types */

function PageEditorModeManager(props) {
  const {
    t, editorMode, onThreeStrandedButtonClicked, isBtnDisabled, isDeviceSmallerThanMd,
  } = props;


  const threeStrandedButtonClickedHandler = useCallback((viewType) => {
    if (isBtnDisabled) {
      return;
    }
    if (onThreeStrandedButtonClicked != null) {
      onThreeStrandedButtonClicked(viewType);
    }
  }, [isBtnDisabled, onThreeStrandedButtonClicked]);

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
            onClick={threeStrandedButtonClickedHandler}
            targetMode="view"
          >
            <i className="icon-control-play icon-fw grw-page-editor-mode-manager-icon" />
            { t('view') }
          </PageEditorModeButtonWrapper>
        )}
        {(!isDeviceSmallerThanMd || editorMode === 'view') && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={threeStrandedButtonClickedHandler}
            targetMode="edit"
          >
            <i className="icon-note icon-fw grw-page-editor-mode-manager-icon" />
            { t('Edit') }
          </PageEditorModeButtonWrapper>
        )}
        {(!isDeviceSmallerThanMd || editorMode === 'view') && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={threeStrandedButtonClickedHandler}
            targetMode="hackmd"
          >
            <i className="fa fa-fw fa-file-text-o grw-page-editor-mode-manager-icon" />
            { t('hackmd.hack_md') }
          </PageEditorModeButtonWrapper>
        )}
      </div>
      {isBtnDisabled && (
        <UncontrolledTooltip placement="top" target="grw-page-editor-mode-manager" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

}

PageEditorModeManager.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  onThreeStrandedButtonClicked: PropTypes.func,
  isBtnDisabled: PropTypes.bool,
  editorMode: PropTypes.string,
  isDeviceSmallerThanMd: PropTypes.bool,
};

PageEditorModeManager.defaultProps = {
  isBtnDisabled: false,
  isDeviceSmallerThanMd: false,
};

export default withTranslation()(PageEditorModeManager);
