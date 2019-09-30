import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import { createSubscribedElement } from './UnstatedUtils';

class ProfileImageUploader extends React.Component {

  handleChangeFile(e) {
    const image = e.target.files[0];
    console.log(typeof image);
  }

  render() {
    return <input type="file" name="profileImage" onChange={this.handleChangeFile} accept="image/*" />;
  }

}
/**
 * Wrapper component for using unstated
 */
const ProfileImageFormWrapper = (props) => {
  return createSubscribedElement(ProfileImageUploader, props, [AppContainer]);
};

ProfileImageUploader.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ProfileImageFormWrapper);
