import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import Accordion from '../Common/Accordion';
// import { toastSuccess, toastError } from '../../../util/apiNotification';
// import CustomBotWithoutProxySecretTokenSection from './CustomBotWithoutProxySecretTokenSection';

export const botInstallationStep = {
  CREATE_BOT: 'create-bot',
  INSTALL_BOT: 'install-bot',
  REGISTER_SLACK_CONFIGURATION: 'register-slack-configuration',
  CONNECTION_TEST: 'connection-test',
};

const OfficialBotSettingsAccordion = ({
  appContainer, activeStep, fetchSlackIntegrationData,
  slackSigningSecret, slackSigningSecretEnv, slackBotToken, slackBotTokenEnv,
  isRegisterSlackCredentials, isSendTestMessage,
  onSetSlackSigningSecret, onSetSlackBotToken, onSetIsSendTestMessage,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        // defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.CREATE_BOT)}
        title={<><span className="mr-2">①</span>{t('admin:slack_integration.accordion.install_bot_to_slack')}</>}
      >
      </Accordion>
      <Accordion
        title={<><span className="mr-2">②</span>{t('admin:slack_integration.accordion.install_bot_to_slack')}</>}
      >
      </Accordion>
      <Accordion
        title={<><span className="mr-2">③</span>{t('admin:slack_integration.accordion.install_bot_to_slack')}</>}
      >
      </Accordion>
      <Accordion
        title={<><span className="mr-2">④</span>{t('admin:slack_integration.accordion.test_connection')}</>}
      >
      </Accordion>
    </div>
  );
};

const OfficialBotSettingsAccordionWrapper = withUnstatedContainers(OfficialBotSettingsAccordion, [AppContainer, AdminAppContainer]);

OfficialBotSettingsAccordion.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,
  isRegisterSlackCredentials: PropTypes.bool,
  isSendTestMessage: PropTypes.bool,
  isConnectedToSlack: PropTypes.bool,
  fetchSlackIntegrationData: PropTypes.func,
  onSetSlackSigningSecret: PropTypes.func,
  onSetSlackBotToken: PropTypes.func,
  onSetIsSendTestMessage: PropTypes.func,
  onSetIsRegisterSlackCredentials: PropTypes.func,
  setSlackWSNameInWithoutProxy: PropTypes.func,

  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
  activeStep: PropTypes.oneOf(Object.values(botInstallationStep)).isRequired,
  isSetupSlackBot: PropTypes.bool,
};

export default OfficialBotSettingsAccordionWrapper;
