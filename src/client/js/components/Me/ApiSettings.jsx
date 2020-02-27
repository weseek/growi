
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';


class ApiSettings extends React.Component {

  render() {
    const { t } = this.props;
    return (
      <div className="mb-5 container-fluid">
        <h2 className="border-bottom">{ t('API Token Settings') }</h2>
      </div>
    );
  }

}

const ApiSettingsWrapper = (props) => {
  return createSubscribedElement(ApiSettings, props, [AppContainer, PersonalContainer]);
};

ApiSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(ApiSettingsWrapper);
