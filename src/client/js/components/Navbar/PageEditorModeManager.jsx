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
    t, editorMode, onThreeStrandedButtonClicked, isBtnDisabled, isMobile,
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
        className="btn-group grw-three-stranded-button"
        role="group"
        aria-label="three-stranded-button"
        id="grw-three-stranded-button"
      >
        {(!isMobile || editorMode !== 'view') && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={threeStrandedButtonClickedHandler}
            targetMode="view"
          >
            <i className="icon-control-play icon-fw grw-three-stranded-button-icon" />
            { t('view') }
          </PageEditorModeButtonWrapper>
        )}
        {(!isMobile || editorMode === 'view') && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={threeStrandedButtonClickedHandler}
            targetMode="edit"
          >
            <i className="icon-note icon-fw grw-three-stranded-button-icon" />
            { t('Edit') }
          </PageEditorModeButtonWrapper>
        )}
        {(!isMobile || editorMode === 'view') && (
          <PageEditorModeButtonWrapper
            editorMode={editorMode}
            isBtnDisabled={isBtnDisabled}
            onClick={threeStrandedButtonClickedHandler}
            targetMode="hackmd"
          >
            <i className="fa fa-fw fa-file-text-o grw-three-stranded-button-icon" />
            { t('hackmd.hack_md') }
          </PageEditorModeButtonWrapper>
        )}
      </div>
      {isBtnDisabled && (
        <UncontrolledTooltip placement="top" target="grw-three-stranded-button" fade={false}>
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
  isMobile: PropTypes.bool,
};

PageEditorModeManager.defaultProps = {
  isBtnDisabled: false,
  isMobile: false,
};

export default withTranslation()(PageEditorModeManager);
