
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class CheckBoxForSerchUserOption extends React.Component {

  render() {
    const { t, option } = this.props;
    return (
      <div className="checkbox checkbox-info mb-5" key={`isAlso${option}Searched`}>
        <input
          type="checkbox"
          id={`isAlso${option}Searched`}
          className="form-check-input"
          checked={this.props.checked}
          onChange={this.props.onChange}
        />
        <label className="text-capitalize form-check-label ml-3" htmlFor={`isAlso${option}Searched`}>
          {t('user_group_management.enable_option', { option })}
        </label>
      </div>
    );
  }

}


CheckBoxForSerchUserOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  option: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.bool.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const CheckBoxForSerchUserOptionWrapper = (props) => {
  return createSubscribedElement(CheckBoxForSerchUserOption, props, [AppContainer]);
};

export default withTranslation()(CheckBoxForSerchUserOptionWrapper);
