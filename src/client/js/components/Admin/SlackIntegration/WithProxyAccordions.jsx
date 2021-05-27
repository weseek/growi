import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess } from '../../../util/apiNotification';
import AppContainer from '../../../services/AppContainer';
import Accordion from '../Common/Accordion';


const BotCreateProcess = () => {
  const { t } = useTranslation();
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
  const { t } = useTranslation();
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

const RegisteringProxyUrlProcess = () => {
  const { t } = useTranslation();
  return (
    <div className="container w-75 py-5">
      <p
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.accordion.copy_proxy_url') }}
      />
      <img className="mb-5 border border-light img-fluid" src="/images/slack-integration/growi-register-sentence.png" />
      <span
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.accordion.enter_proxy_url_and_update') }}
      />
      <p className="text-danger">{t('admin:slack_integration.accordion.dont_need_update')}</p>
      <img className="mb-3 border border-light img-fluid" src="/images/slack-integration/growi-set-proxy-url.png" />
    </div>
  );
};

const GeneratingTokensAndRegisteringProxyServiceProcess = withUnstatedContainers((props) => {
  const { t } = useTranslation();

  const regenerateTokensHandler = () => {
    if (props.generateTokenHandler != null) {
      props.onClickRegenerateTokens();
    }
  };

  const discardTokenHandler = () => {
    if (props.discardTokenHandler != null) {
      props.discardTokenHandler();
    }
  };

  return (
    <div className="py-4 px-5">
      <p className="font-weight-bold">1. {t('admin:slack_integration.accordion.generate_access_token')}</p>
      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">Access Token Proxy to GROWI</label>
        <div className="col-md-6">
          <div className="input-group-prepend mx-1">
            <input className="form-control" type="text" value={props.tokenPtoG || ''} readOnly />
            <CopyToClipboard text={props.tokenPtoG || ''} onCopy={() => toastSuccess(t('admin:slack_integration.copied_to_clipboard'))}>
              <div className="btn input-group-text">
                <i className="fa fa-clipboard mx-1" aria-hidden="true"></i>
              </div>
            </CopyToClipboard>
          </div>
        </div>
      </div>
      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">Access Token GROWI to Proxy</label>
        <div className="col-md-6">
          <div className="input-group-prepend mx-1">
            <input className="form-control" type="text" value={props.tokenGtoP || ''} readOnly />
            <CopyToClipboard text={props.tokenGtoP || ''} onCopy={() => toastSuccess(t('admin:slack_integration.copied_to_clipboard'))}>
              <div className="btn input-group-text">
                <i className="fa fa-clipboard mx-1" aria-hidden="true"></i>
              </div>
            </CopyToClipboard>
          </div>
        </div>
      </div>

      <div className="row my-3">
        <div className="mx-auto">
          <button
            type="button"
            className="btn btn-outline-secondary mx-2"
            onClick={discardTokenHandler}
            disabled={props.tokenGtoP == null || props.tokenPtoG == null}
          >
            { t('admin:slack_integration.access_token_settings.discard') }
          </button>
          <button
            type="button"
            className="btn btn-primary mx-2"
            onClick={regenerateTokensHandler}
          >
            { t('admin:slack_integration.access_token_settings.generate') }
          </button>
        </div>
      </div>
      <p className="font-weight-bold">2. {t('admin:slack_integration.accordion.register_for_growi_official_bot_proxy_service')}</p>
      <div className="d-flex flex-column align-items-center">
        <ol className="p-0">
          <li>
            <p
              className="ml-2"
                // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.accordion.enter_growi_register_on_slack') }}
            />
          </li>
          <li>
            <p
              className="ml-2"
                // TODO: Add dynamic link
                // TODO: Add logo
                // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.accordion.paste_growi_url') }}
            />
            <div className="input-group align-items-center ml-2 mb-3">
              <div className="input-group-prepend mx-1">
                <input className="form-control" type="text" value={props.growiUrl} readOnly />
                <CopyToClipboard text={props.growiUrl} onCopy={() => toastSuccess(t('admin:slack_integration.copied_to_clipboard'))}>
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
        <img className="mb-3 border border-light img-fluid" width={500} src="/images/slack-integration/growi-register-modal.png" />
      </div>
    </div>

  );
}, [AppContainer]);

const TestProcess = () => {
  const { t } = useTranslation();
  const [testChannel, setTestChannel] = useState('');
  /* eslint-disable no-unused-vars */
  // TODO: Add connection Logs
  const [connectionErrorCode, setConnectionErrorCode] = useState(null);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState(null);
  const [connectionSuccessMessage, setConnectionSuccessMessage] = useState(null);

  // TODO: Show test logs
  let value = '';
  if (connectionErrorMessage != null) {
    value = [connectionErrorCode, connectionErrorMessage];
  }
  if (connectionSuccessMessage != null) {
    value = connectionSuccessMessage;
  }


  // TODO: Handle test button
  const submitForm = (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log('Form Submitted');
  };

  const inputTestChannelHandler = (channel) => {
    setTestChannel(channel);
  };

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


const WithProxyAccordions = (props) => {
  const { t } = useTranslation();

  const officialBotIntegrationProcedure = {
    '①': {
      title: 'install_bot_to_slack',
      content: <BotInstallProcess />,
    },
    '②': {
      title: 'register_for_growi_official_bot_proxy_service',
      content: <GeneratingTokensAndRegisteringProxyServiceProcess
        growiUrl={props.appContainer.config.crowi.url}
        discardTokenHandler={props.discardTokenHandler}
        onClickRegenerateTokens={props.onClickRegenerateTokens}
        tokenPtoG={props.tokenPtoG}
        tokenGtoP={props.tokenGtoP}
      />,
    },
    '③': {
      title: 'set_proxy_url_on_growi',
      content: <RegisteringProxyUrlProcess />,
    },
    '④': {
      title: 'test_connection',
      content: <TestProcess />,
    },
  };

  const CustomBotIntegrationProcedure = {
    '①': {
      title: 'create_bot',
      content: <BotCreateProcess />,
    },
    '②': {
      title: 'install_bot_to_slack',
      content: <BotInstallProcess />,
    },
    '③': {
      title: 'register_for_growi_official_bot_proxy_service',
      content: <GeneratingTokensAndRegisteringProxyServiceProcess
        growiUrl={props.appContainer.config.crowi.url}
        discardTokenHandler={props.discardTokenHandler}
        onClickRegenerateTokens={props.onClickRegenerateTokens}
        tokenPtoG={props.tokenPtoG}
        tokenGtoP={props.tokenGtoP}
      />,
    },
    '④': {
      title: 'set_proxy_url_on_growi',
      content: <RegisteringProxyUrlProcess />,
    },
    '⑤': {
      title: 'test_connection',
      content: <TestProcess />,
    },
  };

  const integrationProcedureMapping = props.botType === 'officialBot' ? officialBotIntegrationProcedure : CustomBotIntegrationProcedure;

  return (
    <div
      className="card border-0 rounded-lg shadow overflow-hidden"
    >
      {Object.entries(integrationProcedureMapping).map(([key, value]) => {

        return (
          <Accordion
            title={<><span className="mr-2">{key}</span>{t(`admin:slack_integration.accordion.${value.title}`)}</>}
            key={key}
          >
            {value.content}
          </Accordion>
        );
      })}
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
  discardTokenHandler: PropTypes.func,
  onClickRegenerateTokens: PropTypes.func,
  tokenPtoG: PropTypes.string,
  tokenGtoP: PropTypes.string,
};

export default OfficialBotSettingsAccordionsWrapper;
