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
        <div className="py-4 px-5">
          <p className="font-weight-bold">1. Access Tokenの発行</p>
          <div className="form-group row">
            <label className="text-left text-md-right col-md-3 col-form-label">Access Token for GROWI</label>
            <div className="col-md-6">
              <input
                className="form-control"
                type="text"
              />
            </div>
          </div>
          <div className="form-group row">
            <label className="text-left text-md-right col-md-3 col-form-label">Access Token for Proxy</label>
            <div className="col-md-6">
              <input
                className="form-control"
                type="text"
              />
            </div>
          </div>

          <div className="row my-3">
            <div className="mx-auto">
              <button type="button" className="btn btn-outline-secondary mx-2">破棄</button>
              <button type="button" className="btn btn-primary mx-2">{ t('Update') }</button>
            </div>
          </div>
          <p className="font-weight-bold">2. GROWI Official Bot Proxy サービスへの登録</p>
          <div className="d-flex flex-column align-items-center">
            <ol className="p-0">
              <li><p className="ml-2">Slack上で`/growi register`と打つ</p></li>
              {/* TODO: Copy to clipboard on click */}
              <li>
                <p className="ml-2"><b>GROWI URL</b>には`http://localhost:3000/`<i className="fa fa-clipboard mx-1 text-secondary" aria-hidden="true"></i>を貼り付ける</p>
              </li>
              <li><p className="ml-2">上記で発行した<b>Access Token for GROWI と Access Token for Proxy</b>を入れる</p></li>
            </ol>
            {/* TODO: Insert photo */}
            <div className="rounded border w-50 d-flex justify-content-center align-items-center" style={{ height: '15rem' }}>
              <h1 className="text-muted">参考画像</h1>
            </div>
          </div>
        </div>
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
