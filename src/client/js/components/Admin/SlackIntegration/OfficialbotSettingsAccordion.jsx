import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import loggerFactory from '@alias/logger';
import Accordion from '../Common/Accordion';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

const logger = loggerFactory('growi:SlackBotSettings'); //

const OfficialBotSettingsAccordion = (props) => {
  // TODO: apply i18n by GW-5878
  const { t } = useTranslation();
  const { appContainer } = props;
  const [proxyUri, setProxyUri] = useState(null);

  const growiUrl = appContainer.config.crowi.url;

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
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        title={<><span className="mr-2">①</span>{t('admin:slack_integration.accordion.install_bot_to_slack')}</>}
      >
        <div className="my-5 d-flex flex-column align-items-center">
          {/* TODO: Insert install link */}
          <button type="button" className="btn btn-primary text-nowrap" onClick={() => window.open('https://api.slack.com/apps', '_blank', 'noreferrer')}>
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
      </Accordion>
      <Accordion
        title={<><span className="mr-2">②</span>{t('admin:slack_integration.accordion.register_official_bot_proxy_service')}</>}
      >
        <div className="py-4 px-5">
          <p className="font-weight-bold">1. Access Tokenの発行</p>
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
              <button type="button" className="btn btn-outline-secondary mx-2">破棄</button>
              <button type="button" className="btn btn-primary mx-2">{ t('Update') }</button>
            </div>
          </div>
          <p className="font-weight-bold">2. GROWI Official Bot Proxy サービスへの登録</p>
          <div className="d-flex flex-column align-items-center">
            <ol className="p-0">
              <li><p className="ml-2">Slack上で`/growi register`と打つ</p></li>
              <li>
                <div className="input-group align-items-center ml-2 mb-3">
                  <b> GROWI URL</b>には
                  <div className="input-group-prepend mx-1">
                    <input className="form-control" type="text" value={growiUrl} readOnly />
                    <CopyToClipboard text={growiUrl} onCopy={() => toastSuccess(t('admin:slack_integration.copied_to_clipboard'))}>
                      <div className="btn input-group-text">
                        <i className="fa fa-clipboard mx-1" aria-hidden="true"></i>
                      </div>
                    </CopyToClipboard>
                  </div>
                    を貼り付ける
                </div>
              </li>
              <li><p className="ml-2">上記で発行した<b>Access Token for GROWI と Access Token for Proxy</b>を入れる</p></li>
            </ol>
            {/* TODO: Insert photo by GW5857 */}
            <div className="rounded border w-50 d-flex justify-content-center align-items-center" style={{ height: '15rem' }}>
              <h1 className="text-muted">参考画像</h1>
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion
        title={<><span className="mr-2">③</span>{t('admin:slack_integration.accordion.register_proxy_url')}</>}
      >
        <div className="p-4">
          <p className="text-center">Slack上に通知された<b>Proxy URL</b>を入力し、更新してください。</p>
          <div className="form-group row my-4">
            <label className="text-left text-md-right col-md-3 col-form-label">Proxy URL</label>
            <div className="col-md-6">
              <input
                className="form-control"
                type="text"
                onChange={(e) => { setProxyUri(e.target.value) }}
              />
            </div>
          </div>
          <AdminUpdateButtonRow
            disabled={false}
            onClick={() => updateProxyUri()}
          />
        </div>
      </Accordion>
      <Accordion
        title={<><span className="mr-2">④</span>{t('admin:slack_integration.accordion.test_connection')}</>}
      >
        <p className="text-center m-4">{t('admin:slack_integration.accordion.test_connection_by_pressing_button')}</p>
        <div className="d-flex justify-content-center">
          <form className="form-row align-items-center w-25">
            <div className="col-8 input-group-prepend">
              <span className="input-group-text" id="slack-channel-addon"><i className="fa fa-hashtag" /></span>
              <input
                className="form-control w-100"
                type="text"
                placeholder="Slack Channel"
              />
            </div>
            <div className="col-4">
              <button
                type="submit"
                className="btn btn-info mx-3 font-weight-bold"
              >Test
              </button>
            </div>
          </form>
        </div>
        <form>
          <div className="row my-3 justify-content-center">
            <div className="form-group slack-connection-log w-25">
              <label className="mb-1"><p className="border-info slack-connection-log-title pl-2">Logs</p></label>
              <textarea
                className="form-control card border-info slack-connection-log-body rounded-lg"
                readOnly
              />
            </div>
          </div>
        </form>
      </Accordion>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const OfficialBotSettingsAccordionWrapper = withUnstatedContainers(OfficialBotSettingsAccordion, [AppContainer]);

OfficialBotSettingsAccordion.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default OfficialBotSettingsAccordionWrapper;
