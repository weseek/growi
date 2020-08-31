import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
// import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';

// const logger = loggerFactory('growi:FileUploadSetting');

function FileUploadSetting() {
  return (
    <p>huga</p>
  );
}

/**
 * Wrapper component for using unstated
 */
const FileUploadSettingWrapper = withUnstatedContainers(FileUploadSetting, [AppContainer, AdminAppContainer]);

FileUploadSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(FileUploadSettingWrapper);
