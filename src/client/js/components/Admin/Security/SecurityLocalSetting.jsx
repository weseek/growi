import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

class SecurityLocalSetting extends React.Component {

  render() {
    const { t, adminGeneralSecurityContainer } = this.props;

    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.Local.name') } { t('security_setting.configuration') }
        </h2>

        {adminGeneralSecurityContainer.state.useOnlyEnvVarsForSomeOptions && (
        <p className="alert alert-info">
          { t('security_setting.Local.note for the only env option', 'LOCAL_STRATEGY_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS') }
        </p>
        )}

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.Local.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isLocalEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isLocalEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsLocalEnabled() }}
              />
              <label htmlFor="isLocalEnabled">
                { t('security_setting.Local.enable_local') }
              </label>
            </div>
          </div>
        </div>

        {adminGeneralSecurityContainer.state.isLocalEnabled && (
          <div>
            <div className="row mb-5">
              <strong className="col-xs-3 text-right">{ t('Register limitation') }</strong>
              <div className="col-xs-9 text-left">
                <div className="my-0 btn-group">
                  <div className="dropdown">
                    <button className="btn btn-default dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <span className="pull-left">{t(`security_setting.registration_mode.${adminGeneralSecurityContainer.state.registrationMode}`)}</span>
                      <span className="bs-caret pull-right">
                        <span className="caret" />
                      </span>
                    </button>
                    {/* TODO adjust dropdown after BS4 */}
                    <ul className="dropdown-menu" role="menu">
                      <li
                        key="open"
                        role="presentation"
                        type="button"
                        onClick={() => { adminGeneralSecurityContainer.changeRegistrationMode('open') }}
                      >
                        <a role="menuitem">{ t('security_setting.registration_mode.open') }</a>
                      </li>
                      <li
                        key="restricted"
                        role="presentation"
                        type="button"
                        onClick={() => { adminGeneralSecurityContainer.changeRegistrationMode('restricted') }}
                      >
                        <a role="menuitem">{ t('security_setting.registration_mode.restricted') }</a>
                      </li>
                      <li
                        key="closed"
                        role="presentation"
                        type="button"
                        onClick={() => { adminGeneralSecurityContainer.changeRegistrationMode('closed') }}
                      >
                        <a role="menuitem">{ t('security_setting.registration_mode.closed') }</a>
                      </li>
                    </ul>
                  </div>
                  <p className="help-block">
                    { t('security_setting.Register limitation desc') }
                  </p>
                </div>
              </div>
            </div>
            <div className="row mb-5">
              {/* eslint-disable-next-line react/no-danger */}
              <strong className="col-xs-3 text-right" dangerouslySetInnerHTML={{ __html: t('The whitelist of registration permission E-mail address') }} />
              <div className="col-xs-6">
                <div>
                  <textarea
                    className="form-control"
                    type="textarea"
                    name="registrationWhiteList"
                    placeholder={adminGeneralSecurityContainer.state.registrationWhiteList}
                  />
                  <p className="help-block small">{ t('security_setting.restrict_emails') }<br />{ t('security_setting.for_instance') }
                    <code>@growi.org</code>{ t('security_setting.only_those') }<br />
                    { t('security_setting.insert_single') }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*  TODO replace component */}
        <div className="col-xs-offset-3 col-xs-6 mb-5">
          <button type="submit" className="btn btn-primary">{ t('Update') }</button>
        </div>

      </React.Fragment>
    );
  }

}

SecurityLocalSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const SecurityLocalSettingWrapper = (props) => {
  return createSubscribedElement(SecurityLocalSetting, props, [AppContainer, AdminGeneralSecurityContainer]);
};

export default withTranslation()(SecurityLocalSettingWrapper);
