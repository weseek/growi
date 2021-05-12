import React from 'react';
import { useTranslation } from 'react-i18next';
import OfficialBotSettingsAccordion from './OfficialbotSettingsAccordion';
import CustomBotWithProxyIntegrationCard from './CustomBotWithProxyIntegrationCard';

const OfficialBotSettings = () => {
  const { t } = useTranslation();

  return (
    <>
      <h2 className="admin-setting-header">{t('admin:slack_integration.official_bot_integration')}</h2>
      {/* TODO delete tmp props */}
      <CustomBotWithProxyIntegrationCard
        growiApps={
          [
            { name: 'siteName1', active: true },
            { name: 'siteName2', active: false },
            { name: 'siteName3', active: false },
          ]
        }
        slackWorkSpaces={
          [
            { name: 'wsName1', active: true },
            { name: 'wsName2', active: false },
          ]
        }
        isSlackScopeSet
      />

      <h2 className="admin-setting-header">{t('admin:slack_integration.official_bot_settings')}</h2>

      <div className="my-5 mx-3">
        <OfficialBotSettingsAccordion />
      </div>
    </>

  );
};

export default OfficialBotSettings;
