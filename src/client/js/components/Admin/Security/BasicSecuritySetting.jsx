/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminBasicSecurityContainer from '../../../services/AdminBasicSecurityContainer';

class BasicSecurityManagement extends React.Component {

  render() {
    const { t, adminGeneralSecurityContainer, adminBasicSecurityContainer } = this.props;

    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.Basic.name') } { t('security_setting.configuration') }
        </h2>

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.Basic.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isBasicEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isBasicEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsBasicEnabled() }}
              />
              <label htmlFor="isBasicEnabled">
                { t('security_setting.Basic.enable_basic') }
              </label>
            </div>
            <p className="help-block">
              <small>
                <span dangerouslySetInnerHTML={{ __html: t('security_setting.Basic.desc_1') }} /><br />
                { t('security_setting.Basic.desc_2')}
              </small>
            </p>
          </div>
        </div>

        {adminGeneralSecurityContainer.state.isBasicEnabled && (
        <React.Fragment>
          {adminBasicSecurityContainer.state.hoge}
        </React.Fragment>
        )}

      </React.Fragment>
    );
  }

}

BasicSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminBasicSecurityContainer: PropTypes.instanceOf(AdminBasicSecurityContainer).isRequired,
};

const OidcSecurityManagementWrapper = (props) => {
  return createSubscribedElement(BasicSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminBasicSecurityContainer]);
};

export default withTranslation()(OidcSecurityManagementWrapper);
