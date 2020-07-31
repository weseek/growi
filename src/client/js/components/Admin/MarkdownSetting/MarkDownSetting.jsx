import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

import RenderMarkDownSetting from './RenderMarkDownSetting';

const logger = loggerFactory('growi:MarkDown');

function MarkDownSetting(props) {

  if (props.adminMarkDownContainer.state.isRetrieving) {
    throw new Promise(async() => {
      try {
        await props.adminMarkDownContainer.retrieveMarkdownData();
      }
      catch (err) {
        toastError(err);
        props.adminMarkDownContainer.setState({ retrieveError: err.message });
        logger.error(err);
      }
    });
  }

  return <RenderMarkDownSetting />;
}

const MarkdownSettingWrapper = withUnstatedContainers(MarkDownSetting, [AdminMarkDownContainer]);

MarkDownSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default withTranslation()(MarkdownSettingWrapper);
