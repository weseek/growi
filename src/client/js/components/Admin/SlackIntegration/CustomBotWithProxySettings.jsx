import React, {
  useState, useEffect, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import CustomBotWithProxyIntegrationCard from './CustomBotWithProxyIntegrationCard';
import WithProxyAccordions from './WithProxyAccordions';
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';

const logger = loggerFactory('growi:SlackBotSettings');

const CustomBotWithProxySettings = (props) => {
  const { appContainer, slackAppIntegrations } = props;
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);
  const [proxyUri, setProxyUri] = useState(null);

  const { t } = useTranslation();

  const retrieveProxyUri = useCallback(async() => {
    try {
      const res = await appContainer.apiv3.get('/slack-integration-settings');
      const { proxyUri } = res.data.settings;
      setProxyUri(proxyUri);
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }, [appContainer.apiv3]);

  useEffect(() => {
    retrieveProxyUri();
  }, [retrieveProxyUri]);

  const addSlackAppIntegrationHandler = async() => {
    // TODO implement
  };

  const discardTokenHandler = async(tokenGtoP, tokenPtoG) => {
    try {
      await appContainer.apiv3.delete('/slack-integration-settings/slack-app-integration', { tokenGtoP, tokenPtoG });
    }
    catch (err) {
      toastError(err);
      logger(err);
    }
  };

  const generateTokenHandler = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/access-tokens');
    }
    catch (err) {
      toastError(err);
      logger(err);
    }

  };

  const deleteSlackSettingsHandler = async() => {
    try {
      // TODO imple delete PtoG and GtoP Token at GW 5861
      await appContainer.apiv3.put('/slack-integration-settings/custom-bot-with-proxy');
      toastSuccess('success');
    }
    catch (err) {
      toastError(err);
    }
  };

  const updateProxyUri = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/proxy-uri', {
        proxyUri,
      });
      toastSuccess(t('toaster.update_successed', { target: t('Proxy URL') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  return (
    <>
      <h2 className="admin-setting-header mb-2">{t('admin:slack_integration.custom_bot_with_proxy_integration')}</h2>

      {/* TODO delete tmp props */}
      <CustomBotWithProxyIntegrationCard
        growiApps={
          [
            { name: 'siteName1', active: true },
            { name: 'siteName2', active: false },
            { name: 'siteName3', active: false },
          ]
        }
        slackWorkSpaces={
          [
            { name: 'wsName1', active: true },
            { name: 'wsName2', active: false },
          ]
        }
        isSlackScopeSet
      />

      <div className="form-group row my-4">
        <label className="text-left text-md-right col-md-3 col-form-label mt-3">Proxy URL</label>
        <div className="col-md-6 mt-3">
          <input
            className="form-control"
            type="text"
            name="settingForm[proxyUrl]"
            defaultValue={proxyUri}
            onChange={(e) => { setProxyUri(e.target.value) }}
          />
        </div>
        <div className="col-md-2 mt-3 text-center text-md-left">
          <button type="button" className="btn btn-primary" onClick={updateProxyUri}>{ t('Update') }</button>
        </div>
      </div>

      <h2 className="admin-setting-header">{t('admin:slack_integration.integration_procedure')}</h2>
      <div className="mx-3">
        {slackAppIntegrations.map((slackAppIntegration) => {
          const { tokenGtoP, tokenPtoG } = slackAppIntegration;
          return (
            <React.Fragment key={slackAppIntegration.id}>
              <div className="d-flex justify-content-end">
                <button
                  className="my-3 btn btn-outline-danger"
                  type="button"
                  onClick={() => setIsDeleteConfirmModalShown(true)}
                >
                  <i className="icon-trash mr-1" />
                  {t('admin:slack_integration.delete')}
                </button>
              </div>
              <WithProxyAccordions
                botType="customBotWithProxy"
                discardTokenHandler={() => discardTokenHandler(tokenGtoP, tokenPtoG)}
                generateTokenHandler={generateTokenHandler}
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
        onClickDeleteButton={deleteSlackSettingsHandler}
      />
    </>
  );
};

const CustomBotWithProxySettingsWrapper = withUnstatedContainers(CustomBotWithProxySettings, [AppContainer]);

CustomBotWithProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  slackAppIntegrations: PropTypes.array.isRequired,
};

export default CustomBotWithProxySettingsWrapper;
