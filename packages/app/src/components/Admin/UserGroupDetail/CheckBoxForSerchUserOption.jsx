
import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

class CheckBoxForSerchUserOption extends React.Component {

  render() {
    const { t, option } = this.props;
    return (
      <div className="custom-control custom-checkbox custom-checkbox-info" key={`isAlso${option}Searched`}>
        <input
          type="checkbox"
          id={`isAlso${option}Searched`}
          className="custom-control-input"
          checked={this.props.checked}
          onChange={this.props.onChange}
        />
        <label className="text-capitalize custom-control-label ml-3" htmlFor={`isAlso${option}Searched`}>
          {t('admin:user_group_management.add_modal.enable_option', { option })}
        </label>
      </div>
    );
  }

}

CheckBoxForSerchUserOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  option: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const CheckBoxForSerchUserOptionWrapperFC = (props) => {
  const { t } = useTranslation();
  return <CheckBoxForSerchUserOption t={t} {...props} />;
};

export default CheckBoxForSerchUserOptionWrapperFC;
