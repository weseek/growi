import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

const ProfileImageSettings = () => {
  return (
    <React.Fragment>
      <p>hoge</p>
    </React.Fragment>
  );
};

const ProfileImageSettingsWrapper = (props) => {
  return createSubscribedElement(ProfileImageSettings, props, [AppContainer, PersonalContainer]);
};

ProfileImageSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(ProfileImageSettingsWrapper);
