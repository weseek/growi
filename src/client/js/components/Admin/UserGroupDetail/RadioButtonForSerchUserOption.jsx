
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class RadioButtonForSerchUserOption extends React.Component {

  render() {
    const { t, searchType } = this.props;
    return (
      <div className="radio" key={`${searchType}Match`}>
        <input
          type="radio"
          id={`${searchType}Match`}
          className="form-check-radio"
          checked={this.props.checked}
          onChange={this.props.onChange}
        />
        <label className="text-capitalize form-check-label ml-3" htmlFor={`${searchType}Match`}>
          {t(`user_group_management.${searchType}_match`)}
        </label>
      </div>
    );
  }

}


RadioButtonForSerchUserOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  searchType: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.bool.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const RadioButtonForSerchUserOptionWrapper = (props) => {
  return createSubscribedElement(RadioButtonForSerchUserOption, props, [AppContainer]);
};

export default withTranslation()(RadioButtonForSerchUserOptionWrapper);
