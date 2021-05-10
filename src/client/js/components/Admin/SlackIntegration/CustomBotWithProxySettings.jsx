import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import CustomBotWithProxyIntegrationCard from './CustomBotWithProxyIntegrationCard';
import CustomBotWithProxySettingsAccordion from './CustomBotWithProxySettingsAccordion';

const CustomBotWithProxySettings = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { appContainer, adminAppContainer } = props;
  const { t } = useTranslation();

  // TODO: Multiple accordion logic
  const [accordionComponentsArray, setAccordionComponentArray] = useState(0);
  const addAccordionHandler = () => {
    setAccordionComponentArray(
      prevState => prevState + 1,
    );
  };

  return (
    <>
      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_with_proxy_integration')}</h2>

      {/* TODO delete tmp props */}
      <CustomBotWithProxyIntegrationCard
        siteName="GROWI"
        slackWSNameInWithProxy="SlackWorkSpaceName"
        isSlackScopeSet
      />
      {accordionComponentsArray.map(() => (
        <div className="my-5 mx-3">
          <CustomBotWithProxySettingsAccordion />
        </div>
      ))

      }

      {/* TODO: Disable when integration is incomplete */}
      <div className="row justify-content-center my-5">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={addAccordionHandler}
        >
          + Slackワークスペースを追加
        </button>
      </div>
    </>
  );
};

const CustomBotWithProxySettingsWrapper = withUnstatedContainers(CustomBotWithProxySettings, [AppContainer, AdminAppContainer]);

CustomBotWithProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default CustomBotWithProxySettingsWrapper;
