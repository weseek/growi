import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';

import MarkDownSettingContents from './MarkDownSettingContents';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

const logger = loggerFactory('growi:MarkDown');

function MarkdownSettingWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <MarkdownSettingWithUnstatedContainer />
    </Suspense>
  );
}

let retrieveErrors = null;
function MarkdownSetting(props) {
  const { adminMarkDownContainer } = props;

  if (adminMarkDownContainer.state.isEnabledLinebreaks === adminMarkDownContainer.dummyIsEnabledLinebreaks) {
    throw (async() => {
      try {
        await adminMarkDownContainer.retrieveMarkdownData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        logger.error(errs);
        retrieveErrors = errs;
        adminMarkDownContainer.setState({ isEnabledLinebreaks: adminMarkDownContainer.dummyIsEnabledLinebreaksForError });
      }
    })();
  }

  if (adminMarkDownContainer.state.isEnabledLinebreaks === adminMarkDownContainer.dummyIsEnabledLinebreaksForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return <MarkDownSettingContents />;
}

const MarkdownSettingWithUnstatedContainer = withUnstatedContainers(MarkdownSetting, [AdminMarkDownContainer]);

MarkdownSetting.propTypes = {
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,
};

export default MarkdownSettingWithContainerWithSuspense;
