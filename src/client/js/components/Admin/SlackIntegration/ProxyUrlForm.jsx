import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';
import { useTranslation } from 'react-i18next';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import AppContainer from '../../../services/AppContainer';

const ProxyUrlFrom = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();
  const logger = loggerFactory('growi:SlackBotSettings');

  const updateProxyUri = async() => {
    const proxyUri = props.proxyUri;
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
    <div className="form-group row my-4">
      <label className="text-left text-md-right col-md-3 col-form-label mt-3">Proxy URL</label>
      <div className="col-md-6 mt-3">
        <input
          className="form-control"
          type="text"
          name="settingForm[proxyUrl]"
          defaultValue={props.proxyUri}
          onChange={(e) => { props.setProxyUri(e.target.value) }}
        />
      </div>
      <div className="col-md-2 mt-3 text-center text-md-left">
        <button type="button" className="btn btn-primary" onClick={updateProxyUri} disabled={false}>{ t('Update') }</button>
      </div>
    </div>
  );
};

ProxyUrlFrom.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  proxyUri: PropTypes.string,
  setProxyUri: PropTypes.func.isRequired,
};

export default ProxyUrlFrom;
