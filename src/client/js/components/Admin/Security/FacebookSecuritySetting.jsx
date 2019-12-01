/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

class FacebookSecurityManagement extends React.Component {

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          Facebook OAuth { t('security_setting.configuration') }
        </h2>

        <p className="well">(TBD)</p>

      </React.Fragment>
    );
  }

}


FacebookSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const TwitterSecurityManagementWrapper = (props) => {
  return createSubscribedElement(FacebookSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer]);
};

export default withTranslation()(TwitterSecurityManagementWrapper);
