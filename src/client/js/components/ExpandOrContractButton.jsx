import React from 'react';
import PropTypes from 'prop-types';

function ExpandOrContractButton(props) {
  const { isWindowExpanded, contractWindow, expandWindow } = props;

  const clickContractButtonHandler = () => {
    if (contractWindow != null) {
      contractWindow();
    }
  };

  const clickExpandButtonHandler = () => {
    if (expandWindow != null) {
      expandWindow();
    }
  };

  return (
    <button type="button" className="close" onClick={isWindowExpanded ? clickContractButtonHandler : clickExpandButtonHandler}>
      <i className={`${isWindowExpanded ? 'icon-size-actual' : 'icon-size-fullscreen'}`} style={{ fontSize: '0.8em' }} aria-hidden="true"></i>
    </button>
  );
}

ExpandOrContractButton.propTypes = {
  isWindowExpanded: PropTypes.bool,
  contractWindow: PropTypes.func,
  expandWindow: PropTypes.func,
};


export default ExpandOrContractButton;
