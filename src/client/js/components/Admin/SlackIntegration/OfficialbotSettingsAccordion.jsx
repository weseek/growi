import React from 'react';
import { useTranslation } from 'react-i18next';
import Accordion from '../Common/Accordion';

const OfficialBotSettingsAccordion = () => {
  const { t } = useTranslation();

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        title={<><span className="mr-2">①</span>{t('admin:slack_integration.accordion.install_bot_to_slack')}</>}
      >
        {/* TODO: GW-5824 add accordion contents  */}
        hoge
      </Accordion>
      <Accordion
        title={<><span className="mr-2">②</span>{t('admin:slack_integration.accordion.register_official_bot_proxy_service')}</>}
      >
        {/* TODO: GW-5824 add accordion contents  */}
        hoge
      </Accordion>
      <Accordion
        title={<><span className="mr-2">③</span>{t('admin:slack_integration.accordion.register_proxy_url')}</>}
      >
        {/* TODO: GW-5824 add accordion contents  */}
        hoge
      </Accordion>
      <Accordion
        title={<><span className="mr-2">④</span>{t('admin:slack_integration.accordion.test_connection')}</>}
      >
        {/* TODO: GW-5824 add accordion contents  */}
        hoge
      </Accordion>
    </div>
  );
};

export default OfficialBotSettingsAccordion;
