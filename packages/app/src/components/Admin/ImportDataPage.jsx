import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../UnstatedUtils';
import { toArrayIfNot } from '~/utils/array-utils';
import { withLoadingSppiner } from '../SuspenseUtils';

import AdminImportContainer from '~/client/services/AdminImportContainer';
import { toastError } from '~/client/util/apiNotification';

import ImportDataPageContents from './ImportData/ImportDataPageContents';

const logger = loggerFactory('growi:importer');

let retrieveErrors = null;
function ImportDataPage(props) {
  const { adminImportContainer } = props;

  if (adminImportContainer.state.esaTeamName === adminImportContainer.dummyEsaTeamName) {
    throw (async() => {
      try {
        await adminImportContainer.retrieveImportSettingsData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        logger.error(errs);
        retrieveErrors = errs;
        adminImportContainer.setState({ esaTeamName: adminImportContainer.dummyEsaTeamNameForError });
      }
    })();
  }

  if (adminImportContainer.state.esaTeamName === adminImportContainer.dummyEsaTeamNameForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return <ImportDataPageContents />;
}

ImportDataPage.propTypes = {
  adminImportContainer: PropTypes.instanceOf(AdminImportContainer).isRequired,
};


/**
 * Wrapper component for using unstated
 */
const ImportDataPageWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(ImportDataPage), [AdminImportContainer]);

export default ImportDataPageWithUnstatedContainer;
