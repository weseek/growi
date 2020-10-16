import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const ThreeStrandedButton = (props) => {
  const { t, isBtnDisabled } = props;

  const [btnActive, setBtnActive] = useState('view');
  function threeStrandedButtonClickedHandler(viewType) {
    if (props.onThreeStrandedButtonClicked != null) {
      props.onThreeStrandedButtonClicked(viewType);
    }
    setBtnActive(viewType);
  }

  return (
    <div className="btn-group grw-three-stranded-button" role="group " aria-label="three-stranded-button">
      <button
        type="button"
        className={`btn btn-outline-primary view-button ${btnActive === 'view' && 'active'}`}
        onClick={() => { threeStrandedButtonClickedHandler('view') }}
        disabled={isBtnDisabled}
      >
        <i className="icon-control-play icon-fw" />
        { t('view') }
      </button>
      <button
        type="button"
        className={`btn btn-outline-primary edit-button ${btnActive === 'edit' && 'active'}`}
        onClick={(e) => { threeStrandedButtonClickedHandler('edit') }}
        disabled={isBtnDisabled}
      >
        <i className="icon-note icon-fw" />
        { t('Edit') }
      </button>
      <button
        type="button"
        className={`btn btn-outline-primary hackmd-button ${btnActive === 'hackmd' && 'active'}`}
        onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}
        disabled={isBtnDisabled}
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
  isBtnDisabled: PropTypes.bool,
};

ThreeStrandedButton.defaultProps = {
  isBtnDisabled: false,
};

export default withTranslation()(ThreeStrandedButton);
