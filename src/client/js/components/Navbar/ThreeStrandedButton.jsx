import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

const ThreeStrandedButton = (props) => {
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
          className={`btn btn-outline-primary view-button ${editorMode === 'view' && 'active'} ${isBtnDisabled && 'disabled'}`}
          onClick={() => { threeStrandedButtonClickedHandler('view') }}
        >
          <i className="icon-control-play icon-fw grw-three-stranded-button-icon" />
          { t('view') }
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary edit-button ${editorMode === 'edit' && 'active'} ${isBtnDisabled && 'disabled'}`}
          onClick={() => { threeStrandedButtonClickedHandler('edit') }}
        >
          <i className="icon-note icon-fw grw-three-stranded-button-icon" />
          { t('Edit') }
        </button>
        <button
          type="button"
          className={`btn btn-outline-primary hackmd-button ${editorMode === 'hackmd' && 'active'} ${isBtnDisabled && 'disabled'}`}
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

};

ThreeStrandedButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  onThreeStrandedButtonClicked: PropTypes.func,
  isBtnDisabled: PropTypes.bool,
  editorMode: PropTypes.string,
};

ThreeStrandedButton.defaultProps = {
  isBtnDisabled: false,
};

export default withTranslation()(ThreeStrandedButton);
