import React from 'react';
import PropTypes from 'prop-types';

const UserExtractionCheckBox = (props) => {
  const isSelected = props.isSelected;
  const statusType = props.statusType;
  const handleClick = props.handleClick;
  const label = props.label;

  return (
    <div className="checkbox-inline form-check">
      <input type="checkbox" checked={isSelected} onClick={() => handleClick(statusType)}></input>
      <label className={label}>{statusType}</label>
    </div>
  );
};

UserExtractionCheckBox.propTypes = {
  isSelected: PropTypes.bool,
  statusType: PropTypes.string.isRequired,
  handleClick: PropTypes.func,
  label: PropTypes.string,
};


export default UserExtractionCheckBox;
