import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import CustomBotWithProxyConnectionStatus from './CustomBotWithProxyConnectionStatus';
import WithProxyAccordions from './WithProxyAccordions';
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';

const logger = loggerFactory('growi:SlackBotSettings');

const OfficialBotSettings = (props) => {
  const {
    appContainer, slackAppIntegrations, proxyServerUri, onClickAddSlackWorkspaceBtn, connectionStatuses,
  } = props;
  const [siteName, setSiteName] = useState('');
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);
  const { t } = useTranslation();

  const [newProxyServerUri, setNewProxyServerUri] = useState();

  useEffect(() => {
    if (proxyServerUri != null) {
      setNewProxyServerUri(proxyServerUri);
    }
  }, [proxyServerUri, slackAppIntegrations]);

  const addSlackAppIntegrationHandler = async() => {
    if (onClickAddSlackWorkspaceBtn != null) {
      onClickAddSlackWorkspaceBtn();
    }
  };

  /* commented out to ignore lint error -- 2021.05.31 Yuki Takei
  const discardTokenHandler = async(tokenGtoP, tokenPtoG) => {
    try {
      // GW-6068 set new value after this
      await appContainer.apiv3.delete('/slack-integration-settings/slack-app-integration', { tokenGtoP, tokenPtoG });
    }
    catch (err) {
      toastError(err);
      logger(err);
    }
  };
  */

  const deleteSlackAppIntegrationHandler = async() => {
    try {
      // TODO GW-5923 delete SlackAppIntegration
      // await appContainer.apiv3.put('/slack-integration-settings/custom-bot-with-proxy');
      toastSuccess('success');
    }
    catch (err) {
      toastError(err);
    }
  };

  const updateProxyUri = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/proxy-uri', {
        proxyUri: newProxyServerUri,
      });
      toastSuccess(t('toaster.update_successed', { target: t('Proxy URL') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  useEffect(() => {
    const siteName = appContainer.config.crowi.title;
    setSiteName(siteName);
  }, [appContainer]);

  return (
    <>
      <h2 className="admin-setting-header">{t('admin:slack_integration.official_bot_integration')}</h2>
      <CustomBotWithProxyConnectionStatus
        siteName={siteName}
        connectionStatuses={connectionStatuses}
      />

      <div className="form-group row my-4">
        <label className="text-left text-md-right col-md-3 col-form-label mt-3">Proxy URL</label>
        <div className="col-md-6 mt-3">
          <input
            className="form-control"
            type="text"
            name="settingForm[proxyUrl]"
            defaultValue={newProxyServerUri}
            onChange={(e) => { setNewProxyServerUri(e.target.value) }}
          />
        </div>
        <div className="col-md-2 mt-3 text-center text-md-left">
          <button type="button" className="btn btn-primary" onClick={updateProxyUri}>{ t('Update') }</button>
        </div>
      </div>

      <h2 className="admin-setting-header">{t('admin:slack_integration.integration_procedure')}</h2>

      <div className="mx-3">
        {slackAppIntegrations.map((slackAppIntegration, i) => {
          const { tokenGtoP, tokenPtoG, slackBotToken } = slackAppIntegration;
          const workspaceName = connectionStatuses[slackBotToken]?.workspaceName;
          return (
            <React.Fragment key={slackAppIntegration._id}>
              <div className="my-3 d-flex align-items-center justify-content-between">
                <h2 id={slackBotToken || `settings-#${i}`}>
                  {(workspaceName != null) ? `${workspaceName} Work Space` : `Settings #${i}`}
                </h2>
                <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={() => setIsDeleteConfirmModalShown(true)}
                >
                  <i className="icon-trash mr-1" />
                  {t('admin:slack_integration.delete')}
                </button>
              </div>
              <WithProxyAccordions
                botType="officialBot"
                slackAppIntegrationId={slackAppIntegration._id}
                tokenGtoP={tokenGtoP}
                tokenPtoG={tokenPtoG}
              />
            </React.Fragment>
          );
        })}
        <div className="row justify-content-center my-5">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addSlackAppIntegrationHandler}
          >
            {`+ ${t('admin:slack_integration.accordion.add_slack_workspace')}`}
          </button>
        </div>
      </div>
      <DeleteSlackBotSettingsModal
        isResetAll={false}
        isOpen={isDeleteConfirmModalShown}
        onClose={() => setIsDeleteConfirmModalShown(false)}
        onClickDeleteButton={deleteSlackAppIntegrationHandler}
      />
    </>

  );
};

const OfficialBotSettingsWrapper = withUnstatedContainers(OfficialBotSettings, [AppContainer]);

OfficialBotSettings.defaultProps = {
  slackAppIntegrations: [],
};

OfficialBotSettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  slackAppIntegrations: PropTypes.array,
  proxyServerUri: PropTypes.string,
  onClickAddSlackWorkspaceBtn: PropTypes.func,
  connectionStatuses: PropTypes.object.isRequired,

};

export default OfficialBotSettingsWrapper;
