import React, { Fragment } from 'react';
// import PropTypes from 'prop-types';

// import { withUnstatedContainers } from '../../UnstatedUtils';
// import AppContainer from '../../../services/AppContainer';

import AccessTokenSettings from './AccessTokenSettings';
import CustomBotNonProxySettings from './CustomBotNonProxySettings';

class SlackIntegration extends React.Component {

  render() {
    // const { t } = this.props;

    return (
      <Fragment>
        <div className="row">
          <div className="col-lg-12">
            {/* <h2 className="admin-setting-header">{t('Access Token')}</h2> */}
            <h2 className="admin-setting-header">Access Token</h2>
            <AccessTokenSettings />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            {/* <h2 className="admin-setting-header">{t('Access Token')}</h2> */}
            <h2 className="admin-setting-header">Custom bot (non-proxy) Settings</h2>
            <CustomBotNonProxySettings />
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
