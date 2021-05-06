import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import Accordion from '../Common/Accordion';

const CustomBotWithProxySettingsAccordion = () => {
  const [testChannel, setTestChannel] = useState('');
  const [connectionErrorCode, setConnectionErrorCode] = useState(null);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState(null);
  const [connectionSuccessMessage, setConnectionSuccessMessage] = useState(null);

  const { t } = useTranslation();

  // TODO: Handle test button
  const submitForm = (e) => {
    e.preventDefault();
    console.log('Form Submitted');
  };

  const inputTestChannelHandler = (channel) => {
    setTestChannel(channel);
  };

  // TODO: Show test logs
  let value = '';
  if (connectionErrorMessage != null) {
    value = [connectionErrorCode, connectionErrorMessage];
  }
  if (connectionSuccessMessage != null) {
    value = connectionSuccessMessage;
  }

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        title={<><span className="mr-2">①</span>{t('admin:slack_integration.accordion.create_bot')}</>}
      >
        <div className="my-5 d-flex flex-column align-items-center">
          <button type="button" className="btn btn-primary text-nowrap" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
            {t('admin:slack_integration.accordion.create_bot')}
            <i className="fa fa-external-link ml-2" aria-hidden="true" />
          </button>
          {/* TODO: Insert DOCS link */}
          <a href="#">
            <p className="text-center mt-1">
              <small>
                {t('admin:slack_integration.accordion.how_to_create_a_bot')}
                <i className="fa fa-external-link ml-2" aria-hidden="true" />
              </small>
            </p>
          </a>
        </div>
      </Accordion>
      <Accordion
        title={<><span className="mr-2">②</span>{t('admin:slack_integration.accordion.install_bot_to_slack')}</>}
      >
        <div className="my-5 d-flex flex-column align-items-center">
          {/* TODO: Insert install link */}
          <button type="button" className="btn btn-primary text-nowrap" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
            {t('admin:slack_integration.accordion.install_now')}
            <i className="fa fa-external-link ml-2" aria-hidden="true" />
          </button>
          {/* TODO: Insert DOCS link */}
          <a href="#">
            <p className="text-center mt-1">
              <small>
                {t('admin:slack_integration.accordion.how_to_install')}
                <i className="fa fa-external-link ml-2" aria-hidden="true" />
              </small>
            </p>
          </a>
        </div>
      </Accordion>
      <Accordion
        title={<><span className="mr-2">③</span>アクセストークンの発行 / GROWI Official Bot Proxy サービスへの登録</>}
      >
        <div className="p-4">
          <p>1. Access Tokenの発行</p>
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
          <p>2. GROWI Official Bot Proxy サービスへの登録</p>
          <ol className="d-flex">
            <li><p className="ml-2">Slack上で`/growi register`と打つ</p></li>
            {/* TODO: Copy to clipboard on click */}
            <li>
              <p className="ml-2"><b>GROWI URL</b>には`http://localhost:3000/`<i className="fa fa-clipboard mx-1 text-secondary" aria-hidden="true"></i>を貼り付ける</p>
            </li>
            <li><p className="ml-2">上記で発行した<b>Access Token for GROWI と Access Token for Proxy</b>を入れる</p></li>
          </ol>

        </div>
      </Accordion>
      <Accordion
        title={<><span className="mr-2">④</span>ProxyのURLをGROWIに登録する</>}
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
        title={<><span className="mr-2">⑤</span>連携状況のテストをする</>}
      >
        {/* TODO: Responsive */}
        <p className="text-center m-4">{t('admin:slack_integration.accordion.test_connection_by_pressing_button')}</p>
        <div className="d-flex justify-content-center">
          <form className="form-row align-items-center w-25" onSubmit={e => submitForm(e)}>
            <div className="col-8 input-group-prepend">
              <span className="input-group-text" id="slack-channel-addon"><i className="fa fa-hashtag" /></span>
              <input
                className="form-control w-100"
                type="text"
                value={testChannel}
                placeholder="Slack Channel"
                // TODO: Handle test button
                onChange={e => inputTestChannelHandler(e.target.value)}
              />
            </div>
            <div className="col-4">
              <button
                type="submit"
                className="btn btn-info mx-3 font-weight-bold"
                disabled={testChannel.trim() === ''}
              >Test
              </button>
            </div>
          </form>
        </div>
        {connectionErrorMessage != null
          && <p className="text-danger text-center my-4">{t('admin:slack_integration.accordion.error_check_logs_below')}</p>}
        {connectionSuccessMessage != null
          && <p className="text-info text-center my-4">{t('admin:slack_integration.accordion.send_message_to_slack_work_space')}</p>}
        <form>
          <div className="row my-3 justify-content-center">
            <div className="form-group slack-connection-log w-25">
              <label className="mb-1"><p className="border-info slack-connection-log-title pl-2">Logs</p></label>
              <textarea
                className="form-control card border-info slack-connection-log-body rounded-lg"
                // TODO: Show test logs
                value={value}
                readOnly
              />
            </div>
          </div>
        </form>
      </Accordion>
    </div>
  );
};

export default CustomBotWithProxySettingsAccordion;
