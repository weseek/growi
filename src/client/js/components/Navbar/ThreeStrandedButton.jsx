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
      <button type="button" className="btn btn-outline-primary view-button" onClick={() => { threeStrandedButtonClickedHandler('view') }}>
        <i className="icon-control-play icon-fw" />
        { t('view') }
      </button>
      <button type="button" className="btn btn-outline-primary edit-button" onClick={() => { threeStrandedButtonClickedHandler('edit') }}>
        <i className="icon-note icon-fw" />
        { t('Edit') }
      </button>
      <button type="button" className="btn btn-outline-primary hackmd-button" onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}>
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
