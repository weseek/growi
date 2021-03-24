import React, { Fragment } from 'react';
// import PropTypes from 'prop-types';

// import { withUnstatedContainers } from '../../UnstatedUtils';
// import AppContainer from '../../../services/AppContainer';

class SlackIntegration extends React.Component {

  render() {
    // const { t } = this.props;

    return (
      <Fragment>
        <div className="row">
          <div className="col-lg-12">
            {/* <h2 className="admin-setting-header">{t('Access Token')}</h2> */}
            <h2 className="admin-setting-header">Access Token</h2>
            <div className="form-group row">
              {/* <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:app_setting.site_name')}</label> */}
              <label className="text-left text-md-right col-md-3 col-form-label">Access Token</label>

              <div className="col-md-6">
                <input className="form-control" type="text" placeholder="access-token" />
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

}

// const SlackIntegrationWrapper = withUnstatedContainers(SlackIntegration, [AppContainer]);

// SlackIntegration.propTypes = {
//   t: PropTypes.func.isRequired, // i18next
//   appContainer: PropTypes.instanceOf(AppContainer).isRequired,
// slackIntegrationContainer: PropTypes.instanceOf(SlackIntegrationContainer).isRequired,
// };

export default SlackIntegration;
