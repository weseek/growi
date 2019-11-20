import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminSecurityContainer from '../../../services/AdminSecurityContainer';

class SecurityLocalSetting extends React.Component {

  constructor(props) {
    super();


    this.state = {
      isLocalEnabled: true,
      // TODO show selected value at here
      modeValue: 'open',
    };

    this.switchIsLocalEnabled = this.switchIsLocalEnabled.bind(this);
  }

  switchIsLocalEnabled() {
    this.setState({ isLocalEnabled: !this.state.isLocalEnabled });
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.Local.name') } { t('security_setting.configuration') }
        </h2>

        {/* TODO show or hide */}
        <p className="alert alert-info">
          { t('security_setting.Local.note for the only env option', 'LOCAL_STRATEGY_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS') }
        </p>

        <div className="col-xs-offset-3 col-xs-6">
          <div className="checkbox checkbox-success">
            <input
              id="isLocalEnabled"
              type="checkbox"
              checked={this.state.isLocalEnabled}
              onChange={() => { this.switchIsLocalEnabled() }}
            />
            <label htmlFor="isLocalEnabled">
              <strong>{ t('security_setting.Local.name') }</strong>
            </label>
          </div>
        </div>

        {this.state.isLocalEnabled && (

        <div className="form-group">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <div className="my-0 btn-group">
              <label>{ t('Register limitation') }</label>
              <div className="dropdown">
                <button className="btn btn-default dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="pull-left">{t(`security_setting.registration_mode.${this.state.modeValue}`)}</span>
                  <span className="bs-caret pull-right">
                    <span className="caret" />
                  </span>
                </button>
                {/* TODO adjust dropdown after BS4 */}
                <ul className="dropdown-menu" role="menu">
                  <li key="open" role="presentation" type="button" onClick={() => { this.setState({ modeValue: 'open' }) }}>
                    <a role="menuitem">{ t('security_setting.registration_mode.open') }</a>
                  </li>
                  <li key="restricted" role="presentation" type="button" onClick={() => { this.setState({ modeValue: 'restricted' }) }}>
                    <a role="menuitem">{ t('security_setting.registration_mode.restricted') }</a>
                  </li>
                  <li key="closed" role="presentation" type="button" onClick={() => { this.setState({ modeValue: 'closed' }) }}>
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

        )}


        {/*  TODO replace component */}
        <div className="col-xs-offset-3 col-xs-6 mt-5">
          <button type="submit" className="btn btn-primary">{ t('Update') }</button>
        </div>

      </React.Fragment>
    );
  }

}

SecurityLocalSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminSecurityContainer: PropTypes.instanceOf(AdminSecurityContainer).isRequired,
};

const SecurityLocalSettingWrapper = (props) => {
  return createSubscribedElement(SecurityLocalSetting, props, [AppContainer, AdminSecurityContainer]);
};

export default withTranslation()(SecurityLocalSettingWrapper);
