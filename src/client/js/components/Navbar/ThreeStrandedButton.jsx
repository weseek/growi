import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';


// [TODO: rename Threestranded Button by gw4545]
export const ThreeStrandedButton = withTranslation()((props) => {
  const { t, isBtnDisabled, editorMode } = props;


  function threeStrandedButtonClickedHandler(viewType) {
    if (isBtnDisabled) {
      return;
    }
    if (props.onThreeStrandedButtonClicked != null) {
      props.onThreeStrandedButtonClicked(viewType);
    }
  }

  return (
    <>
      <div
        className="btn-group grw-three-stranded-button"
        role="group"
        aria-label="three-stranded-button"
        id="grw-three-stranded-button"
      >
        <button
          type="button"
          className={`btn btn-outline-primary view-button ${editorMode === 'view' ? 'active' : ''} ${isBtnDisabled ? 'disabled' : ''}`}
          onClick={() => { threeStrandedButtonClickedHandler('view') }}
        >
          <i className="icon-control-play icon-fw grw-three-stranded-button-icon" />
          { t('view') }
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary edit-button ${editorMode === 'edit' ? 'active' : ''} ${isBtnDisabled ? 'disabled' : ''}`}
          onClick={() => { threeStrandedButtonClickedHandler('edit') }}
        >
          <i className="icon-note icon-fw grw-three-stranded-button-icon" />
          { t('Edit') }
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary hackmd-button ${editorMode === 'hackmd' ? 'active' : ''} ${isBtnDisabled ? 'disabled' : ''}`}
          onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}
        >
          <i className="fa fa-fw fa-file-text-o grw-three-stranded-button-icon" />
          { t('hackmd.hack_md') }
        </button>
      </div>
      {isBtnDisabled && (
        <UncontrolledTooltip placement="top" target="grw-three-stranded-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

});

ThreeStrandedButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  onThreeStrandedButtonClicked: PropTypes.func,
  isBtnDisabled: PropTypes.bool,
  editorMode: PropTypes.string,
};

ThreeStrandedButton.defaultProps = {
  isBtnDisabled: false,
};


export const TwoStrandedButton = withTranslation()((props) => {
  const { t, isBtnDisabled, editorMode } = props;


  function threeStrandedButtonClickedHandler(viewType) {
    if (isBtnDisabled) {
      return;
    }
    if (props.onThreeStrandedButtonClicked != null) {
      props.onThreeStrandedButtonClicked(viewType);
    }
  }

  function viewButton() {
    return (
      <button
        type="button"
        className={`btn btn-outline-primary view-button ${editorMode === 'view' && 'active'} ${isBtnDisabled && 'disabled'}`}
        onClick={() => { threeStrandedButtonClickedHandler('view') }}
      >
        <i className="icon-control-play icon-fw grw-three-stranded-button-icon" />
        { t('view') }
      </button>
    );
  }
  function editButton() {
    return (
      <button
        type="button"
        className={`btn btn-outline-primary edit-button ${editorMode === 'edit' && 'active'} ${isBtnDisabled && 'disabled'}`}
        onClick={() => { threeStrandedButtonClickedHandler('edit') }}
      >
        <i className="icon-note icon-fw grw-three-stranded-button-icon" />
        { t('Edit') }
      </button>
    );
  }
  function hackMDButton() {
    return (
      <button
        type="button"
        className={`btn btn-outline-primary hackmd-button ${editorMode === 'hackmd' && 'active'} ${isBtnDisabled && 'disabled'}`}
        onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}
      >
        <i className="fa fa-fw fa-file-text-o grw-three-stranded-button-icon" />
        { t('hackmd.hack_md') }
      </button>
    );
  }

  return (
    <>
      <div
        className="btn-group grw-three-stranded-button"
        role="group"
        aria-label="three-stranded-button"
        id="grw-three-stranded-button"
      >
        {editorMode === 'view' && <>{editButton()} {hackMDButton()}</>}
        {editorMode === 'edit' && viewButton}
        {editorMode === 'hackmd' && viewButton}
      </div>
      {isBtnDisabled && (
        <UncontrolledTooltip placement="top" target="grw-three-stranded-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

});

TwoStrandedButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  onThreeStrandedButtonClicked: PropTypes.func,
  isBtnDisabled: PropTypes.bool,
  editorMode: PropTypes.string,
};

TwoStrandedButton.defaultProps = {
  isBtnDisabled: false,
};


export const PageEditorModeManager = withTranslation()((props) => {
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

  const renderViewButton = useCallback(() => {
    return (
      <button
        type="button"
        className={`btn btn-outline-primary view-button ${editorMode === 'view' && 'active'} ${isBtnDisabled && 'disabled'}`}
        onClick={() => { threeStrandedButtonClickedHandler('view') }}
      >
        <i className="icon-control-play icon-fw grw-three-stranded-button-icon" />
        { t('view') }
      </button>
    );
  }, [editorMode, isBtnDisabled, t, threeStrandedButtonClickedHandler]);

  const renderEditButton = useCallback(() => {
    return (
      <button
        type="button"
        className={`btn btn-outline-primary edit-button ${editorMode === 'edit' && 'active'} ${isBtnDisabled && 'disabled'}`}
        onClick={() => { threeStrandedButtonClickedHandler('edit') }}
      >
        <i className="icon-note icon-fw grw-three-stranded-button-icon" />
        { t('Edit') }
      </button>
    );
  }, [editorMode, isBtnDisabled, t, threeStrandedButtonClickedHandler]);

  const renderHackMDButton = useCallback(() => {
    return (
      <button
        type="button"
        className={`btn btn-outline-primary hackmd-button ${editorMode === 'hackmd' && 'active'} ${isBtnDisabled && 'disabled'}`}
        onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}
      >
        <i className="fa fa-fw fa-file-text-o grw-three-stranded-button-icon" />
        { t('hackmd.hack_md') }
      </button>
    );
  }, [editorMode, isBtnDisabled, t, threeStrandedButtonClickedHandler]);

  return (
    <>
      <div
        className="btn-group grw-three-stranded-button"
        role="group"
        aria-label="three-stranded-button"
        id="grw-three-stranded-button"
      >
        {editorMode === 'view' && <>{renderEditButton()} {renderHackMDButton()}</>}
        {!isMobile && editorMode !== 'view' && renderViewButton()}
      </div>
      {isBtnDisabled && (
        <UncontrolledTooltip placement="top" target="grw-three-stranded-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

});

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
