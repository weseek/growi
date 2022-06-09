
import React from 'react';

import PropTypes from 'prop-types';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import AppContainer from '~/client/services/AppContainer';

import { withLoadingSppiner } from '../../SuspenseUtils';
import { withUnstatedContainers } from '../../UnstatedUtils';


function SmtpSetting(props) {
  const { adminAppContainer } = props;

  return (
    <React.Fragment>
      <div id="mail-smtp" className="tab-pane active mt-5">

        <div className="row form-group">
          <label className="text-left text-md-right col-md-3 col-form-label">
            Access key ID
          </label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.sesAccessKeyId || ''}
              onChange={(e) => {
                adminAppContainer.changeSesAccessKeyId(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="row form-group">
          <label className="text-left text-md-right col-md-3 col-form-label">
            Secret access key
          </label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.sesSecretAccessKey || ''}
              onChange={(e) => {
                adminAppContainer.changeSesSecretAccessKey(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

    </React.Fragment>
  );
}

/**
 * Wrapper component for using unstated
 */
const SmtpSettingWrapper = withUnstatedContainers(withLoadingSppiner(SmtpSetting), [AppContainer, AdminAppContainer]);

SmtpSetting.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default SmtpSettingWrapper;
