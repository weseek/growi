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
  const [accordionComponentsArray, setAccordionComponentsArray] = useState(0);
  const addAccordionHandler = () => {
    setAccordionComponentsArray(
      prevState => prevState + 1,
    );
  };

  return (
    <>
      <h2 className="admin-setting-header mb-2">{t('admin:slack_integration.custom_bot_with_proxy_integration')}</h2>

      {/* TODO delete tmp props */}
      <CustomBotWithProxyIntegrationCard
        siteName="GROWI"
        slackWSNameInWithProxy="SlackWorkSpaceName"
        isSlackScopeSet
      />
      <h2 className="admin-setting-header">{t('admin:slack_integration.cooperation_procedure')}</h2>
      <div className="mx-3">

        {/* // TODO: Multiple accordion logic */}
        {Array(...Array(accordionComponentsArray)).map(i => (
          <>
            <div>
              <button
                className="my-3 btn btn-outline-danger"
                type="button"
              >
                <i className="icon-trash mr-1" />
                {t('admin:slack_integration.delete')}
              </button>
            </div>
            <div>
              <CustomBotWithProxySettingsAccordion key={i} />
            </div>
          </>
        ))}

        {/* TODO: Disable button when integration is incomplete */}
        {/* TODO: i18n */}
        <div className="row justify-content-center my-5">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addAccordionHandler}
          >
            + Slackワークスペースを追加
          </button>
        </div>
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
