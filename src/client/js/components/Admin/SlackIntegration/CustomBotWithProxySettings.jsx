import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import CustomBotWithProxyIntegrationCard from './CustomBotWithProxyIntegrationCard';
import CustomBotWithProxySettingsAccordion from './CustomBotWithProxySettingsAccordion';

const CustomBotWithProxySettings = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { appContainer, adminAppContainer } = props;
  const { t } = useTranslation();

  // TODO: Multiple accordion logic
  const [accordionComponentsCount, setAccordionComponentsCount] = useState(0);
  const addAccordionHandler = () => {
    setAccordionComponentsCount(
      prevState => prevState + 1,
    );
  };
  // TODO: Delete accordion logic
  const deleteAccordionHandler = () => {
    setAccordionComponentsCount(
      prevState => prevState - 1,
    );
  };

  return (
    <>
      <h2 className="admin-setting-header mb-2">{t('admin:slack_integration.custom_bot_with_proxy_integration')}</h2>

      {/* TODO delete tmp props */}
      <CustomBotWithProxyIntegrationCard
        siteNames={
          [
            { name: 'siteName1', active: true },
            { name: 'siteName2', active: false },
            { name: 'siteName3', active: false },
          ]
        }
        slackWorkSpaceNames={
          ['wsName1', 'wsName2']}
        isSlackScopeSet
      />
      <h2 className="admin-setting-header">{t('admin:slack_integration.cooperation_procedure')}</h2>
      <div className="mx-3">

        {/* // TODO: Multiple accordion logic */}
        {Array(...Array(accordionComponentsCount)).map(i => (
          <>
            <div className="d-flex justify-content-end">
              <button
                className="my-3 btn btn-outline-danger"
                type="button"
                onClick={deleteAccordionHandler}
              >
                <i className="icon-trash mr-1" />
                {t('admin:slack_integration.delete')}
              </button>
            </div>
            <CustomBotWithProxySettingsAccordion key={i} />
          </>
        ))}

        {/* TODO: Disable button when integration is incomplete */}
        {/* TODO: i18n */}
        <div className="row justify-content-center my-5">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addAccordionHandler}
          >
            + Slackワークスペースを追加
          </button>
        </div>
      </div>
    </>
  );
};

const CustomBotWithProxySettingsWrapper = withUnstatedContainers(CustomBotWithProxySettings, [AppContainer, AdminAppContainer]);

CustomBotWithProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default CustomBotWithProxySettingsWrapper;
