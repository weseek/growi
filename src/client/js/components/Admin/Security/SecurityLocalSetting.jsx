import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class SecurityLocalSetting extends React.Component {

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
          <div className="form-group">
            <div className="checkbox checkbox-success">
              <input
                id="nameForIsLocalEnabled"
                type="checkbox"
                checked
              />
              <label htmlFor="nameForIsLocalEnabled">
                <strong>{ t('security_setting.Local.name') }</strong>
              </label>
            </div>
          </div>


          <div className="form-group" id="btn-update">
            <button type="submit" className="btn btn-primary">{ t('Update') }</button>

          </div>
        </div>

      </React.Fragment>
    );
  }

}

SecurityLocalSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

const SecurityLocalSettingWrapper = (props) => {
  return createSubscribedElement(SecurityLocalSetting, props, [AppContainer]);
};

export default withTranslation()(SecurityLocalSettingWrapper);
