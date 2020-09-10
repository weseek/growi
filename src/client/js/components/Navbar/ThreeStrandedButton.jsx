import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const ThreeStrandedButton = (props) => {

  const { t } = props;

  function threeStrandedButtonClickedHandler(viewType) {
    if (props.onThreeStrandedButtonClicked != null) {
      props.onThreeStrandedButtonClicked(viewType);
    }
  }

  return (
    <div className="btn-group grw-three-stranded-button" role="group " aria-label="three-stranded-button">
      <button
        type="button"
        className="btn btn-outline-primary view-button"
        onClick={(e) => {
          e.preventDefault();
          threeStrandedButtonClickedHandler('revision-body');
          window.location.href = '#';
          }}
      >
        <i className="icon-control-play icon-fw" />
        { t('view') }
      </button>
      <button
        type="button"
        className="btn btn-outline-primary edit-button"
        onClick={(e) => {
          e.preventDefault();
          threeStrandedButtonClickedHandler('edit');
          window.location.href = '#edit';
        }}
      >
        <i className="icon-note icon-fw" />
        { t('Edit') }
      </button>
      <button
        type="button"
        className="btn btn-outline-primary edit-button"
        onClick={(e) => {
          e.preventDefault();
          threeStrandedButtonClickedHandler('hackmd');
          window.location.href = '#hackmd';
        }}
      >
        <i className="fa fa-fw fa-file-text-o" />
        { t('hackmd.hack_md') }
      </button>
    </div>
  );

};

ThreeStrandedButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  onThreeStrandedButtonClicked: PropTypes.func,
};

export default withTranslation()(ThreeStrandedButton);
