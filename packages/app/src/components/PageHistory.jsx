import React, { useState, useCallback, useEffect } from 'react';

import PropTypes from 'prop-types';

import RevisionComparerContainer from '~/client/services/RevisionComparerContainer';
import { toastError } from '~/client/util/apiNotification';
import { useCurrentPageId } from '~/stores/context';
import { useSWRxPageRevisions } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import PageRevisionTable from './PageHistory/PageRevisionTable';
import PaginationWrapper from './PaginationWrapper';
import RevisionComparer from './RevisionComparer/RevisionComparer';
import { withLoadingSppiner } from './SuspenseUtils';
import { withUnstatedContainers } from './UnstatedUtils';


const logger = loggerFactory('growi:PageHistory');

function PageHistory(props) {
  const [activePage, setActivePage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const { data: currentPageId } = useCurrentPageId();
  const { data: revisionsData } = useSWRxPageRevisions(currentPageId, 1, 10);
  const pagingLimit = 10;

  const { revisionComparerContainer } = props;

  useEffect(() => {
    throw new Promise(async() => {
      try {
        await props.revisionComparerContainer.initRevisions();
      }
      catch (err) {
        toastError(err);
        setErrorMessage(err.message);
        logger.error(err);
      }
    });
  }, [props.revisionComparerContainer]);


  if (errorMessage != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{errorMessage}</div>
      </div>
    );
  }

  function pager() {
    return (
      <PaginationWrapper
        activePage={activePage}
        changePage={setActivePage}
        totalItemsCount={revisionsData.totalCounts}
        pagingLimit={pagingLimit}
        align="center"
      />
    );
  }

  return (
    <div className="revision-history">
      <PageRevisionTable
        revisionComparerContainer={revisionComparerContainer}
        revisions={revisionsData.revisions}
        pagingLimit
      />
      <div className="my-3">
        {pager()}
      </div>
      <RevisionComparer />
    </div>
  );

}

const RenderPageHistoryWrapper = withUnstatedContainers(withLoadingSppiner(PageHistory), [RevisionComparerContainer]);

PageHistory.propTypes = {
  revisionComparerContainer: PropTypes.instanceOf(RevisionComparerContainer).isRequired,
};

export default RenderPageHistoryWrapper;
