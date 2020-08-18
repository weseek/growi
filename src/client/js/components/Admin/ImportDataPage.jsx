import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../UnstatedUtils';

import AdminImportContainer from '../../services/AdminImportContainer';
import { toastError } from '../../util/apiNotification';

import ImportDataPageContents from './ImportData/ImportDataPageContents';

const logger = loggerFactory('growi:importer');

function ImportDataPageWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <ImportDataPageWithUnstatedContainer />
    </Suspense>
  );
}

let retrieveError = null;
function ImportDataPage(props) {
  const { adminImportContainer } = props;

  if (adminImportContainer.state.esaTeamName === adminImportContainer.dummyEsaTeamName) {
    throw (async() => {
      try {
        await adminImportContainer.retrieveImportSettingsData();
      }
      catch (err) {
        toastError(err);
        adminImportContainer.setState({ esaTeamName: adminImportContainer.dummyEsaTeamNameForError });
        retrieveError = err;
        logger.error(err);
      }
    })();
  }

  if (adminImportContainer.state.esaTeamName === adminImportContainer.dummyEsaTeamNameForError) {
    throw new Error(retrieveError[0].message);
  }

  return <ImportDataPageContents />;
}

ImportDataPage.propTypes = {
  adminImportContainer: PropTypes.instanceOf(AdminImportContainer).isRequired,
};


/**
 * Wrapper component for using unstated
 */
const ImportDataPageWithUnstatedContainer = withUnstatedContainers(ImportDataPage, [AdminImportContainer]);

export default ImportDataPageWithContainerWithSuspense;
