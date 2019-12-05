/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminBasicSecurityContainer from '../../../services/AdminBasicSecurityContainer';

const logger = loggerFactory('growi:security:AdminTwitterSecurityContainer');

class BasicSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      retrieveError: null,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    const { adminBasicSecurityContainer } = this.props;

    try {
      await adminBasicSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
      this.setState({ retrieveError: err });
      logger.error(err);
    }
  }

  async onClickSubmit() {
    const { t, adminBasicSecurityContainer } = this.props;

    try {
      await adminBasicSecurityContainer.updateBasicSetting();
      toastSuccess(t('security_setting.OAuth.Twitter.updated_twitter'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminBasicSecurityContainer } = this.props;

    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.Basic.name') } { t('security_setting.configuration') }
        </h2>

        {this.state.retrieveError != null && (
        <div className="alert alert-danger">
          <p>{t('Error occurred')} : {this.state.err}</p>
        </div>
        )}

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
          <div className="row mb-5">
            <div className="col-xs-offset-3 col-xs-6 text-left">
              <div className="checkbox checkbox-success">
                <input
                  id="bindByEmail-basic"
                  type="checkbox"
                  checked={adminBasicSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                  onChange={() => { adminBasicSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                />
                <label
                  htmlFor="bindByEmail-basic"
                  dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical', 'username') }}
                />
              </div>
              <p className="help-block">
                <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical_warn', 'username') }} />
              </p>
            </div>
          </div>
        </React.Fragment>
        )}

        <div className="row my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button type="button" className="btn btn-primary" disabled={this.state.retrieveError != null} onClick={this.onClickSubmit}>{ t('Update') }</button>
          </div>
        </div>

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
