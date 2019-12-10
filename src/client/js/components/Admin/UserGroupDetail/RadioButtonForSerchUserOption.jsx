
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';

class RadioButtonForSerchUserOption extends React.Component {

  render() {
    const { t, userGroupDetailContainer, searchType } = this.props;
    return (
      <div className="radio mb-5" key={`${searchType}Match`}>
        <input
          type="radio"
          id={`${searchType}Match`}
          className="form-check-radio"
          checked={userGroupDetailContainer.state.searchType === searchType}
          onChange={() => { userGroupDetailContainer.switchSearchType(searchType) }}
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
  userGroupDetailContainer: PropTypes.instanceOf(UserGroupDetailContainer).isRequired,

  searchType: PropTypes.string.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const RadioButtonForSerchUserOptionWrapper = (props) => {
  return createSubscribedElement(RadioButtonForSerchUserOption, props, [AppContainer, UserGroupDetailContainer]);
};

export default withTranslation()(RadioButtonForSerchUserOptionWrapper);
