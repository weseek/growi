/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminLocalSecurityContainer from '../../../services/AdminLocalSecurityContainer';

class LocalSecuritySetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRetrieving: true,
    };
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    const { adminLocalSecurityContainer } = this.props;

    try {
      await adminLocalSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
    }
    this.setState({ isRetrieving: false });
  }


  async onClickSubmit() {
    const { t, adminGeneralSecurityContainer, adminLocalSecurityContainer } = this.props;
    try {
      await adminLocalSecurityContainer.updateLocalSecuritySetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminLocalSecurityContainer } = this.props;
    const { registrationMode } = adminLocalSecurityContainer.state;
    const { isLocalEnabled } = adminGeneralSecurityContainer.state;

    if (this.state.isRetrieving) {
      return null;
    }

    return (
      <React.Fragment>
        {this.state.retrieveError != null && (
          <div className="alert alert-danger">
            <p>{t('Error occurred')} : {this.state.err}</p>
          </div>
        )}
        <h2 className="alert-anchor border-bottom">
          {t('security_setting.Local.name')}
        </h2>

        {adminGeneralSecurityContainer.state.useOnlyEnvVarsForSomeOptions && (
          <p
            className="alert alert-info"
            // eslint-disable-next-line max-len
            dangerouslySetInnerHTML={{ __html: t('security_setting.Local.note for the only env option', { env: 'LOCAL_STRATEGY_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS' }) }}
          />
        )}

        <div className="row mb-5">
          <div className="col-xs-3 my-3 text-right">
            <strong>{t('security_setting.Local.name')}</strong>
          </div>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isLocalEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isLocalEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsLocalEnabled() }}
              />
              <label htmlFor="isLocalEnabled">
                {t('security_setting.Local.enable_local')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('local') && isLocalEnabled)
            && <div className="label label-warning">{t('security_setting.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        {isLocalEnabled && (
          <React.Fragment>

            <h3 className="border-bottom">{t('security_setting.configuration')}</h3>

            <div className="row mb-5">
              <strong className="col-xs-3 text-right">{t('Register limitation')}</strong>
              <div className="col-xs-9 text-left">
                <div className="my-0 btn-group">
                  <div className="dropdown">
                    <button className="btn btn-default dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      {registrationMode === 'Open' && <span className="pull-left">{t('security_setting.registration_mode.open')}</span>}
                      {registrationMode === 'Restricted' && <span className="pull-left">{t('security_setting.registration_mode.restricted')}</span>}
                      {registrationMode === 'Closed' && <span className="pull-left">{t('security_setting.registration_mode.closed')}</span>}
                      <span className="bs-caret pull-right">
                        <span className="caret" />
                      </span>
                    </button>
                    {/* TODO adjust dropdown after BS4 */}
                    <ul className="dropdown-menu" role="menu">
                      <li
                        key="Open"
                        role="presentation"
                        type="button"
                        onClick={() => { adminLocalSecurityContainer.changeRegistrationMode('Open') }}
                      >
                        <a role="menuitem">{t('security_setting.registration_mode.open')}</a>
                      </li>
                      <li
                        key="Restricted"
                        role="presentation"
                        type="button"
                        onClick={() => { adminLocalSecurityContainer.changeRegistrationMode('Restricted') }}
                      >
                        <a role="menuitem">{t('security_setting.registration_mode.restricted')}</a>
                      </li>
                      <li
                        key="Closed"
                        role="presentation"
                        type="button"
                        onClick={() => { adminLocalSecurityContainer.changeRegistrationMode('Closed') }}
                      >
                        <a role="menuitem">{t('security_setting.registration_mode.closed')}</a>
                      </li>
                    </ul>
                  </div>
                  <p className="help-block">
                    {t('security_setting.Register limitation desc')}
                  </p>
                </div>
              </div>
            </div>
            <div className="row mb-5">
              <strong className="col-xs-3 text-right" dangerouslySetInnerHTML={{ __html: t('The whitelist of registration permission E-mail address') }} />
              <div className="col-xs-6">
                <div>
                  <textarea
                    className="form-control"
                    type="textarea"
                    name="registrationWhiteList"
                    defaultValue={adminLocalSecurityContainer.state.registrationWhiteList.join('\n')}
                    onChange={e => adminLocalSecurityContainer.changeRegistrationWhiteList(e.target.value)}
                  />
                  <p className="help-block small">{t('security_setting.restrict_emails')}<br />{t('security_setting.for_instance')}
                    <code>@growi.org</code>{t('security_setting.only_those')}<br />
                    {t('security_setting.insert_single')}
                  </p>
                </div>
              </div>
            </div>

            <div className="row my-3">
              <div className="col-xs-offset-3 col-xs-5">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={adminLocalSecurityContainer.state.retrieveError != null}
                  onClick={this.onClickSubmit}
                >
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

LocalSecuritySetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminLocalSecurityContainer: PropTypes.instanceOf(AdminLocalSecurityContainer).isRequired,
};

const LocalSecuritySettingWrapper = (props) => {
  return createSubscribedElement(LocalSecuritySetting, props, [AppContainer, AdminGeneralSecurityContainer, AdminLocalSecurityContainer]);
};

export default withTranslation()(LocalSecuritySettingWrapper);
