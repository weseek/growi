import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

import MarkDownSettingPageContents from './MarkDownSettingPageContents';

const logger = loggerFactory('growi:MarkDown');

function MarkDownSetting(props) {

  if (props.adminMarkDownContainer.state.isEnabledLinebreaks === 0) {
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

  return <MarkDownSettingPageContents />;
}

const MarkdownSettingWrapper = withUnstatedContainers(MarkDownSetting, [AdminMarkDownContainer]);

MarkDownSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

function MarkdownSettingSuspenseWrapper(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <MarkdownSettingWrapper />
    </Suspense>
  );
}


export default MarkdownSettingSuspenseWrapper;
