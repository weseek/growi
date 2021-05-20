import React, {
  useState, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import CustomBotWithProxyIntegrationCard from './CustomBotWithProxyIntegrationCard';
import WithProxyAccordions from './WithProxyAccordions';

const logger = loggerFactory('growi:SlackBotSettings');

const OfficialBotSettings = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();
  const [proxyUri, setProxyUri] = useState(null);

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
      <h2 className="admin-setting-header">{t('admin:slack_integration.official_bot_integration')}</h2>
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
          <button type="button" className="btn btn-primary" onClick={updateProxyUri} disabled={false}>{ t('Update') }</button>
        </div>
      </div>

      <h2 className="admin-setting-header">{t('admin:slack_integration.official_bot_settings')}</h2>

      <div className="my-5 mx-3">
        <WithProxyAccordions botType="officialBot" />
      </div>
    </>

  );
};

const OfficialBotSettingsWrapper = withUnstatedContainers(OfficialBotSettings, [AppContainer]);

OfficialBotSettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default OfficialBotSettingsWrapper;
