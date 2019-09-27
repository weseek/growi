import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import { createSubscribedElement } from './UnstatedUtils';

class ProfileImageForm extends React.Component {

  render() {
    return (
      <div></div>
    );
  }

}
/**
 * Wrapper component for using unstated
 */
const ProfileImageFormWrapper = (props) => {
  return createSubscribedElement(ProfileImageForm, props, [AppContainer]);
};

ProfileImageForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ProfileImageFormWrapper);
