
import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

const RadioButtonForSerchUserOption = (props) => {

  const { searchType } = props;
  const { t } = useTranslation();
  return (
    <div className="custom-control custom-radio custom-control-inline" key={`${searchType}Match`}>
      <input
        type="radio"
        id={`${searchType}Match`}
        className="custom-control-input"
        checked={props.checked}
        onChange={props.onChange}
      />
      <label className="text-capitalize custom-control-label ms-3" htmlFor={`${searchType}Match`}>
        {t(`admin:user_group_management.add_modal.${searchType}_match`)}
      </label>
    </div>
  );
};


RadioButtonForSerchUserOption.propTypes = {

  searchType: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RadioButtonForSerchUserOption;
