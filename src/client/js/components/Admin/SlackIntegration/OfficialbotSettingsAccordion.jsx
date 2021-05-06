import React from 'react';
import { useTranslation } from 'react-i18next';
import Accordion from '../Common/Accordion';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

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
        <div className="p-4">
          <p className="text-center">Slack上に通知された<b>Proxy URL</b>を入力し、更新してください。</p>
          <div className="form-group row my-4">
            <label className="text-left text-md-right col-md-3 col-form-label">Proxy URL</label>
            <div className="col-md-6">
              <input
                className="form-control"
                type="text"
              />
            </div>
          </div>
          <AdminUpdateButtonRow
            disabled={false}
            // TODO: Add Proxy URL submit logic
            onClick={() => console.log('Update')}
          />
        </div>
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
