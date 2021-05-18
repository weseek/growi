import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess } from '../../../util/apiNotification';
import AppContainer from '../../../services/AppContainer';
import Accordion from '../Common/Accordion';

const WithProxyAccordions = (props) => {
  const [testChannel, setTestChannel] = useState('');
  /* eslint-disable no-unused-vars */
  // TODO: Add connection Logs
  const [connectionErrorCode, setConnectionErrorCode] = useState(null);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState(null);
  const [connectionSuccessMessage, setConnectionSuccessMessage] = useState(null);
  const [proxyUri, setProxyUri] = useState(null);

  const { t } = useTranslation();
  const growiUrl = props.appContainer.config.crowi.url;

  // TODO: Handle test button
  const submitForm = (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
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

  const BotCreateProcess = () => {
    return (
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
    );
  };

  const BotInstallProcess = () => {
    return (
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
    );
  };

  const genelatingTokensAndRegisteringProxyServiceProcess = () => {
    return (
      <div className="py-4 px-5">
        <p className="font-weight-bold">1. {t('admin:slack_integration.accordion.generate_access_token')}</p>
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
            <button type="button" className="btn btn-outline-secondary mx-2">{ t('admin:slack_integration.access_token_settings.discard') }</button>
            <button type="button" className="btn btn-primary mx-2">{ t('admin:slack_integration.access_token_settings.generate') }</button>
          </div>
        </div>
        <p className="font-weight-bold">2. {t('admin:slack_integration.accordion.register_for_growi_official_bot_proxy_service')}</p>
        <div className="d-flex flex-column align-items-center">
          <ol className="p-0">
            <li><p className="ml-2">{t('admin:slack_integration.accordion.enter_growi_register_on_slack')}</p></li>
            <li>
              <p
                className="ml-2"
                  // TODO: Add dynamic link
                  // TODO: Copy to clipboard on click
                  // TODO: Add logo
                  // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.accordion.paste_growi_url') }}
              />
              <div className="input-group align-items-center ml-2 mb-3">
                <div className="input-group-prepend mx-1">
                  <input className="form-control" type="text" value={growiUrl} readOnly />
                  <CopyToClipboard text={growiUrl} onCopy={() => toastSuccess(t('admin:slack_integration.copied_to_clipboard'))}>
                    <div className="btn input-group-text">
                      <i className="fa fa-clipboard mx-1" aria-hidden="true"></i>
                    </div>
                  </CopyToClipboard>
                </div>
              </div>

            </li>
            <li>
              <p
                className="ml-2"
                  // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.accordion.enter_access_token_for_growi_and_proxy') }}
              />
            </li>
          </ol>
          {/* TODO: Insert photo */}
          <div className="rounded border w-50 d-flex justify-content-center align-items-center" style={{ height: '15rem' }}>
            <h1 className="text-muted">参考画像</h1>
          </div>
        </div>
      </div>

    );
  };

  const registeringProxyUrlProcess = () => {
    return (
      <div className="p-4 d-flex flex-column align-items-center">
        <div>
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.accordion.enter_proxy_url_and_update') }}
          />
          <p className="text-danger">{t('admin:slack_integration.accordion.dont_need_update')}</p>
        </div>
        <div className="rounded border w-50 d-flex justify-content-center align-items-center" style={{ height: '15rem' }}>
          <h1 className="text-muted">参考画像</h1>
        </div>
      </div>
    );
  };

  const testProcess = () => {
    return (
      <>
        <p className="text-center m-4">{t('admin:slack_integration.accordion.test_connection_by_pressing_button')}</p>
        <div className="d-flex justify-content-center">
          <form className="form-row justify-content-center" onSubmit={e => submitForm(e)}>
            <div className="input-group col-8">
              <div className="input-group-prepend">
                <span className="input-group-text" id="slack-channel-addon"><i className="fa fa-hashtag" /></span>
              </div>
              <input
                className="form-control"
                type="text"
                value={testChannel}
                placeholder="Slack Channel"
              // TODO: Handle test button
                onChange={e => inputTestChannelHandler(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-info mx-3 font-weight-bold"
              disabled={testChannel.trim() === ''}
            >Test
            </button>
          </form>
        </div>
        {connectionErrorMessage != null
        && <p className="text-danger text-center my-4">{t('admin:slack_integration.accordion.error_check_logs_below')}</p>}
        {connectionSuccessMessage != null
        && <p className="text-info text-center my-4">{t('admin:slack_integration.accordion.send_message_to_slack_work_space')}</p>}
        <form>
          <div className="row my-3 justify-content-center">
            <div className="form-group slack-connection-log col-md-4">
              <label className="mb-1"><p className="border-info slack-connection-log-title pl-2 m-0">Logs</p></label>
              <textarea
                className="form-control card border-info slack-connection-log-body rounded-lg"
                rows="5"
              // TODO: Show test logs
                value={value}
                readOnly
              />
            </div>
          </div>
        </form>
      </>
    );
  };

  const customBotCooperationProcedure = {
    contents: [BotCreateProcess, BotInstallProcess, genelatingTokensAndRegisteringProxyServiceProcess, registeringProxyUrlProcess, testProcess],
    i18n: ['create_bot', 'install_bot_to_slack', 'register_for_growi_official_bot_proxy_service', 'set_proxy_url_on_growi', 'accordion.test_connection'],
  };

  const officialBotCooperationProcedure = {
    create_bot: BotInstallProcess(),
    install_bot_to_slack: BotInstallProcess(),
    register_for_growi_official_bot_proxy_service: genelatingTokensAndRegisteringProxyServiceProcess(),
    set_proxy_url_on_growi:  registeringProxyUrlProcess(),
    test_connection: testProcess(),
  };

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      {Object.entries(officialBotCooperationProcedure).map(([key, value]) => {
        return (
          <Accordion
            title={<><span className="mr-2">1</span>{t(`admin:slack_integration.accordion.${key}`)}</>}
            key={key}
          >
            {/* {BotCreateProcess()} */}
            {value}
          </Accordion>
        );
      })}
      {/* <Accordion
        title={<><span className="mr-2">①</span>{t('admin:slack_integration.accordion.create_bot')}</>}
      >
        {BotCreateProcess()}
      </Accordion> */}
      {/* {props.botType === 'customBotWithProxy'
      && (
        <Accordion
          title={<><span className="mr-2">①</span>{t('admin:slack_integration.accordion.create_bot')}</>}
        >
          {BotCreateProcess()}
        </Accordion>
      )}

      <Accordion
        title={(
          <>
            <span className="mr-2">{props.botType === 'customBotWithProxy' ? '②' : '①'}</span>
            {t('admin:slack_integration.accordion.install_bot_to_slack')}
          </>
        )}
      >
        {BotInstallProcess()}
      </Accordion>
      <Accordion
        title={(
          <>
            <span className="mr-2">{props.botType === 'customBotWithProxy' ? '③' : '②'}</span>
            {t('admin:slack_integration.accordion.generate_access_token')}
            {' / '}
            {t('admin:slack_integration.accordion.register_for_growi_official_bot_proxy_service')}
          </>
        )}
      >
        {genelatingTokensAndRegisteringProxyServiceProcess()}
      </Accordion>
      <Accordion
        title={(
          <><span className="mr-2">{props.botType === 'customBotWithProxy' ? '④' : '③'}</span>
            {t('admin:slack_integration.accordion.set_proxy_url_on_growi')}
          </>
        )}
      >
        {registeringProxyUrlProcess()}
      </Accordion>
      <Accordion
        title={(
          <><span className="mr-2">{props.botType === 'customBotWithProxy' ? '⑤' : '④'}</span>
            {t('admin:slack_integration.accordion.test_connection')}
          </>
        )}
      >
        {testProcess()}
      </Accordion> */}
    </div>
  );
};


/**
 * Wrapper component for using unstated
 */

const OfficialBotSettingsAccordionsWrapper = withUnstatedContainers(WithProxyAccordions, [AppContainer]);
WithProxyAccordions.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  botType: PropTypes.string.isRequired,
};

export default OfficialBotSettingsAccordionsWrapper;
