/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminGoogleSecurityContainer from '../../../services/AdminGoogleSecurityContainer';

class GoogleSecurityManagement extends React.Component {

  render() {
    const { t, adminGeneralSecurityContainer, adminGoogleSecurityContainer } = this.props;
    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.OAuth.Google.name') } { t('security_setting.configuration') }
        </h2>

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.OAuth.Google.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isGoogleEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isGoogleOAuthEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsGoogleOAuthEnabled() }}
              />
              <label htmlFor="isGoogleEnabled">
                { t('security_setting.OAuth.Google.enable_google') }
              </label>
            </div>
          </div>
        </div>

        {adminGeneralSecurityContainer.state.isGoogleOAuthEnabled && (
          // TODO
          <p>{adminGoogleSecurityContainer.state.hoge}</p>
        )}

      </React.Fragment>


    );
  }

}


GoogleSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminGoogleSecurityContainer: PropTypes.instanceOf(AdminGoogleSecurityContainer).isRequired,
};

const GoogleSecurityManagementWrapper = (props) => {
  return createSubscribedElement(GoogleSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminGoogleSecurityContainer]);
};

export default withTranslation()(GoogleSecurityManagementWrapper);
