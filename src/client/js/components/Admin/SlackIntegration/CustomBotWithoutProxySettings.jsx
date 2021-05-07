import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';
import CustomBotWithoutProxyIntegrationCard from './CustomBotWithoutProxyIntegrationCard';
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer, slackSettingErrors } = props;
  const { t } = useTranslation();

  const [siteName, setSiteName] = useState('');
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);


  const onSetIsSetupSlackBot = () => {
    if (props.onSetIsSetupSlackBot != null) {
      props.onSetIsSetupSlackBot();
    }
  };

  // const onSetIsSlackScopeSet = () => {
  //   if (props.onSetIsSlackScopeSet != null) {
  //     props.onSetIsSlackScopeSet();
  //   }
  // };

  const deleteSlackCredentialsHandler = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration/custom-bot-without-proxy', {
        slackSigningSecret: '',
        slackBotToken: '',
        currentBotType: '',
      });
      onSetIsSetupSlackBot(false);
      // onSetIsSlackScopeSet(false);
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
        slackSettingErrors={slackSettingErrors}
        // isSlackScopeSet={slackSettingErrors.isSlackScopeSet}
        // isSetupSlackBot={slackSettingErrors.isSetupSlackBot}
      />

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_settings')}</h2>

      {!slackSettingErrors.includes(false) && (
      <button
        className="pull-right btn text-danger border-danger"
        type="button"
        onClick={() => setIsDeleteConfirmModalShown(true)}
      >{t('admin:slack_integration.reset')}
      </button>
      ) }

      <div className="my-5 mx-3">
        <CustomBotWithoutProxySettingsAccordion
          {...props}
          activeStep={botInstallationStep.CREATE_BOT}
        />
      </div>
      <DeleteSlackBotSettingsModal
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
  // isSlackScopeSet: PropTypes.bool,
  // isSetupSlackBot: PropTypes.bool,
  slackSettingErrors: PropTypes.array,
  slackWSNameInWithoutProxy: PropTypes.string,
  onSetIsSetupSlackBot: PropTypes.func,
  onSetIsSlackScopeSet: PropTypes.func,
};

export default CustomBotWithoutProxySettingsWrapper;
