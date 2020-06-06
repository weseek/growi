/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminBasicSecurityContainer from '../../../services/AdminBasicSecurityContainer';

class BasicSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRetrieving: true,
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
    }
    this.setState({ isRetrieving: false });
  }

  async onClickSubmit() {
    const { t, adminBasicSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminBasicSecurityContainer.updateBasicSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_setting.Basic.updated_basic'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminBasicSecurityContainer } = this.props;
    const { isBasicEnabled } = adminGeneralSecurityContainer.state;

    if (this.state.isRetrieving) {
      return null;
    }
    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.Basic.name') }
        </h2>

        {this.state.retrieveError != null && (
        <div className="alert alert-danger">
          <p>{t('Error occurred')} : {this.state.err}</p>
        </div>
        )}

        <div className="form-group row">
          <div className="col-6 offset-3">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                id="isBasicEnabled"
                className="custom-control-input"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isBasicEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsBasicEnabled() }}
              />
              <label className="custom-control-label" htmlFor="isBasicEnabled">
                { t('security_setting.Basic.enable_basic') }
              </label>
            </div>
            <p className="form-text text-muted">
              <small>
                <span dangerouslySetInnerHTML={{ __html: t('security_setting.Basic.desc_1') }} /><br />
                { t('security_setting.Basic.desc_2')}
              </small>
            </p>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('basic') && isBasicEnabled)
            && <div className="badge badge-warning">{t('security_setting.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        {isBasicEnabled && (
        <React.Fragment>
          <div className="row mb-5">
            <div className="offset-md-3 col-md-6">
              <div className="custom-control custom-checkbox custom-checkbox-success">
                <input
                  id="bindByEmail-basic"
                  className="custom-control-input"
                  type="checkbox"
                  checked={adminBasicSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser || false}
                  onChange={() => { adminBasicSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                />
                <label
                  className="custom-control-label"
                  htmlFor="bindByEmail-basic"
                  dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical', 'username') }}
                />
              </div>
              <p className="form-text text-muted">
                <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical_warn', 'username') }} />
              </p>
            </div>
          </div>

          <div className="row my-3">
            <div className="offset-4 col-5">
              <button type="button" className="btn btn-primary" disabled={adminBasicSecurityContainer.state.retrieveError != null} onClick={this.onClickSubmit}>
                {t('Update')}
              </button>
            </div>
          </div>

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

const OidcSecurityManagementWrapper = withUnstatedContainers(BasicSecurityManagement, [AppContainer, AdminGeneralSecurityContainer, AdminBasicSecurityContainer]);

export default withTranslation()(OidcSecurityManagementWrapper);
