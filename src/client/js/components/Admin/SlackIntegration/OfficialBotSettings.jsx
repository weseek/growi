import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomBotWithProxyIntegrationCard from './CustomBotWithProxyIntegrationCard';
import WithProxyAccordions from './WithProxyAccordions';

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
        <WithProxyAccordions botType="officialBot" />
      </div>
    </>

  );
};

export default OfficialBotSettings;
