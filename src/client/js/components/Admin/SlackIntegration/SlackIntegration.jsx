import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import AccessTokenSettings from './AccessTokenSettings';
import CustomBotNonProxySettings from './CustomBotNonProxySettings';

class SlackIntegration extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="row">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('admin:slack_integration.access_token')}</h2>
            <AccessTokenSettings />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('admin:slack_integration.custom_button_non_proxy_settings')}</h2>
            <CustomBotNonProxySettings />
          </div>
        </div>

      </Fragment>
    );
  }

}

SlackIntegration.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(SlackIntegration);
