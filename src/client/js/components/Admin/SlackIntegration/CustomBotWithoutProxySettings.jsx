import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';
import CustomBotWithoutProxyIntegrationCard from './CustomBotWithoutProxyIntegrationCard';
import DeleteSlackCredentialsModal from './DeleteSlackCredentialsModal';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer, isSlackScopeSet, isSetupSlackBot } = props;
  const { t } = useTranslation();

  const [siteName, setSiteName] = useState('');
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);

  const deleteSlackCredentialsHandler = async() => {
    try {
      await appContainer.apiv3.put('slack-integration/custom-bot-without-proxy', {
        slackSigningSecret: '',
        slackBotToken: '',
        currentBotType: 'customBotWithoutProxy',
      });
      props.onSetIsSlackScopeSet(false);
      props.fetchSlackIntegrationData();
      toastSuccess('success');
    }
    catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    const siteName = appContainer.config.crowi.title;
    setSiteName(siteName);
  }, [appContainer]);

  return (
    <>
      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_integration')}</h2>

      <CustomBotWithoutProxyIntegrationCard
        siteName={siteName}
        slackWSNameInWithoutProxy={props.slackWSNameInWithoutProxy}
        isSlackScopeSet={props.isSlackScopeSet}
        isSetupSlackBot={props.isSetupSlackBot}
      />

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_settings')}</h2>

      {isSlackScopeSet && isSetupSlackBot && (
      <button
        className="pull-right btn text-danger border-danger"
        type="button"
        onClick={() => setIsDeleteConfirmModalShown(true)}
      >リセット
      </button>
      ) }

      <div className="my-5 mx-3">
        <CustomBotWithoutProxySettingsAccordion
          {...props}
          activeStep={botInstallationStep.CREATE_BOT}
        />
      </div>
      <DeleteSlackCredentialsModal
        isOpen={isDeleteConfirmModalShown}
        onClose={() => setIsDeleteConfirmModalShown(false)}
        onClickDeleteButton={deleteSlackCredentialsHandler}
      />
    </>
  );
};

const CustomBotWithoutProxySettingsWrapper = withUnstatedContainers(CustomBotWithoutProxySettings, [AppContainer, AdminAppContainer]);

CustomBotWithoutProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,
  isRgisterSlackCredentials: PropTypes.bool,
  isConnectedToSlack: PropTypes.bool,
  isSlackScopeSet: PropTypes.bool,
  isSetupSlackBot: PropTypes.bool,
  slackWSNameInWithoutProxy: PropTypes.string,
  onSetIsSetupSlackBot: PropTypes.func,
  onSetIsSlackScopeSet: PropTypes.func,
  fetchSlackIntegrationData: PropTypes.func,
};

export default CustomBotWithoutProxySettingsWrapper;
