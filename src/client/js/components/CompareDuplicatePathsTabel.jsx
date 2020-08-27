import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import PageContainer from '../services/PageContainer';

function CompareDuplicatePathsTable(props) {
  // ToDo this will be implemented by GW-3374
  // the return value will be either a tabel or false(boolean) if there are no duplicate path
  return (
    false
  );
}


/**
 * Wrapper component for using unstated
 */
const PageDuplicateModallWrapper = withUnstatedContainers(CompareDuplicatePathsTable, [PageContainer]);

CompareDuplicatePathsTable.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  subordinatedPages: PropTypes.array.isRequired,
  newPagePath: PropTypes.string.isRequired,
};


export default withTranslation()(PageDuplicateModallWrapper);
