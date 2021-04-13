import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import BotSettingsAccordion from './BotSettingsAccordion';

const CustomBotWithoutProxySettingsAccordion = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation('admin');
  const [openAccordionIndexes, setOpenAccordionIndexes] = useState(new Set());
  const [connectionErrorLog, setConnectionErrorLog] = useState({});

  const onToggleAccordionHandler = (i) => {
    const accordionIndexes = new Set(openAccordionIndexes);
    if (accordionIndexes.has(i)) {
      accordionIndexes.delete(i);
    }
    else {
      accordionIndexes.add(i);
    }
    setOpenAccordionIndexes(accordionIndexes);
  };

  const onTestConnectionHandler = async() => {
    setConnectionErrorLog({ connectionErrorCode: null, connectionErrorMessage: null });
    try {
      await appContainer.apiv3.post('slack-integration/notification-test-to-slack-work-space', {
        // TODO put proper request
        channel: 'testchannel',
      });
    }
    catch (err) {
      setConnectionErrorLog(prevState => ({
        ...prevState,
        connectionErrorCode: err[0].code,
        connectionErrorMessage: err[0].message,
      }));
    }
  };

  return (
    <BotSettingsAccordion>
      <BotSettingsAccordion.Item
        isActive={openAccordionIndexes.has(0)}
        itemNumber="①"
        title={t('slack_integration.without_proxy.create_bot')}
        onToggleAccordionHandler={() => onToggleAccordionHandler(0)}
      >
        <div className="row my-5">
          <div className="mx-auto">
            <div>
              <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
                {t('slack_integration.without_proxy.create_bot')}
                <i className="fa fa-external-link ml-2" aria-hidden="true" />
              </button>
            </div>
            {/* TODO: Insert DOCS link */}
            <a href="#">
              <p className="text-center mt-1">
                <small>
                  {t('slack_integration.without_proxy.how_to_create_a_bot')}
                  <i className="fa fa-external-link ml-2" aria-hidden="true" />
                </small>
              </p>
            </a>
          </div>
        </div>
      </BotSettingsAccordion.Item>
      <BotSettingsAccordion.Item
        isActive={openAccordionIndexes.has(1)}
        itemNumber="②"
        title={t('slack_integration.without_proxy.install_bot_to_slack')}
        onToggleAccordionHandler={() => onToggleAccordionHandler(1)}
      >
        <div className="container w-75 py-5">
          <p>1. Install your app をクリックします。</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-introduction.png" className="border border-light img-fluid mb-5" />
          <p>2. Install to Workspace をクリックします。</p>
          <img src="/images/slack-integration/slack-bot-install-to-workspace.png" className="border border-light img-fluid mb-5" />
          <p>3. 遷移先の画面にて、Allowをクリックします。</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-transition-destination.png" className="border border-light img-fluid mb-5" />
          <p>4. Install your app の右側に 緑色のチェックがつけばワークスペースへのインストール完了です。</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-complete.png" className="border border-light img-fluid mb-5" />
          <p>5. GROWI bot を使いたいチャンネルに @example を使用して招待します。</p>
          <img src="/images/slack-integration/slack-bot-install-to-workspace-joined-bot.png" className="border border-light img-fluid mb-1" />
          <img src="/images/slack-integration/slack-bot-install-your-app-introduction-to-channel.png" className="border border-light img-fluid" />
        </div>
      </BotSettingsAccordion.Item>
      <BotSettingsAccordion.Item
        isActive={openAccordionIndexes.has(2)}
        itemNumber="③"
        title={t('slack_integration.without_proxy.register_secret_and_token')}
        onToggleAccordionHandler={() => onToggleAccordionHandler(2)}
      >
        ボディー
      </BotSettingsAccordion.Item>
      <BotSettingsAccordion.Item
        isActive={openAccordionIndexes.has(3)}
        itemNumber="④"
        title={t('slack_integration.without_proxy.test_connection')}
        onToggleAccordionHandler={() => onToggleAccordionHandler(3)}
      >
        <p className="text-center m-4">以下のテストボタンを押して、Slack連携が完了しているかの確認をしましょう</p>
        <div className="d-flex justify-content-center">
          <button type="button" className="btn btn-info m-3 px-5 font-weight-bold" onClick={onTestConnectionHandler}>Test</button>
        </div>
        {connectionErrorLog.connectionErrorMessage != null
          && <p className="text-danger text-center m-4">エラーが発生しました。下記のログを確認してください。</p>
        }
        <div className="row m-3 justify-content-center">
          <div className="col-sm-5 slack-connection-error-log">
            <p className="border-info slack-connection-error-log-title mb-1 pl-2">Logs</p>
            <div className="card border-info slack-connection-error-log-body rounded-lg px-5 py-4">
              <p className="m-0">{connectionErrorLog.connectionErrorCode}</p>
              <p className="m-0">{connectionErrorLog.connectionErrorMessage}</p>
            </div>
          </div>
        </div>
      </BotSettingsAccordion.Item>
    </BotSettingsAccordion>
  );
};

const CustomBotWithoutProxySettingsAccordionWrapper = withUnstatedContainers(CustomBotWithoutProxySettingsAccordion, [AppContainer]);

CustomBotWithoutProxySettingsAccordion.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default CustomBotWithoutProxySettingsAccordionWrapper;
