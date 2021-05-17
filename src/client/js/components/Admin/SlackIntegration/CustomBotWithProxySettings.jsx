import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import CustomBotWithProxyIntegrationCard from './CustomBotWithProxyIntegrationCard';
import CustomBotWithProxySettingsAccordion from './CustomBotWithProxySettingsAccordion';
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const CustomBotWithProxySettings = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { appContainer, adminAppContainer } = props;
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);

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

  const deleteSlackSettingsHandler = async() => {
    try {
      // TODO imple delete PtoG and GtoP Token at GW 5861
      await appContainer.apiv3.put('/slack-integration-settings/custom-bot-with-proxy', {
      });
      deleteAccordionHandler();
      toastSuccess('success');
    }
    catch (err) {
      toastError(err);
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
        <div className="col-md-6 mr-3 mt-3">
          <input
            className="form-control"
            type="text"
          />
        </div>
        <AdminUpdateButtonRow
          disabled={false}
          // TODO: Add Proxy URL submit logic
          // eslint-disable-next-line no-console
          onClick={() => console.log('Update')}
        />
      </div>

      <h2 className="admin-setting-header">{t('admin:slack_integration.cooperation_procedure')}</h2>
      <div className="mx-3">

        {/* // TODO: Multiple accordion logic */}
        {Array(...Array(accordionComponentsCount)).map(i => (
          <>
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

const CustomBotWithProxySettingsWrapper = withUnstatedContainers(CustomBotWithProxySettings, [AppContainer, AdminAppContainer]);

CustomBotWithProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default CustomBotWithProxySettingsWrapper;
