import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

function ExpandOrContractButton(props) {
  const { isWindowExpanded, contractWindow, expandWindow } = props;

  const getClassName = useMemo(() => {
    return isWindowExpanded ? 'icon-size-actual' : 'icon-size-fullscreen';
  }, [isWindowExpanded]);

  const clickContractButtonHandler = useEffect(() => {
    if (contractWindow != null) {
      contractWindow();
    }
  }, [contractWindow]);

  const clickExpandButtonHandler = useEffect(() => {
    if (expandWindow != null) {
      expandWindow();
    }
  }, [expandWindow]);

  return (
    <button type="button" className="close" onClick={isWindowExpanded ? clickContractButtonHandler : clickExpandButtonHandler}>
      <i className={getClassName} style={{ fontSize: '0.8em' }} aria-hidden="true"></i>
    </button>
  );
}

ExpandOrContractButton.propTypes = {
  isWindowExpanded: PropTypes.bool,
  contractWindow: PropTypes.func,
  expandWindow: PropTypes.func,
};


export default ExpandOrContractButton;
