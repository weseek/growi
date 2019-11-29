/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

class GoogleSecurityManagement extends React.Component {

  render() {
    const { t } = this.props;
    return (

      <h2 className="alert-anchor border-bottom">
        { t('security_setting.OAuth.Google.name') } { t('security_setting.configuration') }
      </h2>
    );
  }

}


GoogleSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const GoogleSecurityManagementWrapper = (props) => {
  return createSubscribedElement(GoogleSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer]);
};

export default withTranslation()(GoogleSecurityManagementWrapper);
