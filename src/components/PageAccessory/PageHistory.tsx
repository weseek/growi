import React, {
  useCallback, useState, FC, useEffect,
} from 'react';
import loggerFactory from '@alias/logger';

// import { toastError } from '../util/apiNotification';

// import { withLoadingSppiner } from './SuspenseUtils';
// import PageRevisionList from './PageHistory/PageRevisionList';

import { PaginationWrapper } from '~/components/PaginationWrapper';

import { useCurrentPageHistorySWR } from '~/stores/page';

const logger = loggerFactory('growi:PageHistory');

export const PageHistory:FC = () => {
  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(100);
  const [limit, setLimit] = useState(10);

  const { data: paginationResult } = useCurrentPageHistorySWR(activePage, limit);

  const handlePage = useCallback(async(selectedPage) => {
    setActivePage(selectedPage);
  }, []);

  useEffect(() => {
    if (paginationResult == null) {
      return;
    }
    setActivePage(paginationResult.page);
    setTotalItemsCount(paginationResult.totalDocs);
    setLimit(paginationResult.limit);
  }, [paginationResult]);

  return (
    <>
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalItemsCount}
        pagingLimit={limit}
        align="center"
      />
    </>
  );
};

// function DeprecatePageHistory(props) {
//   const { pageHistoryContainer } = props;
//   const { getPreviousRevision, onDiffOpenClicked } = pageHistoryContainer;
//   const {
//     activePage, totalPages, pagingLimit, revisions, diffOpened,
//   } = pageHistoryContainer.state;

//   const handlePage = useCallback(async(selectedPage) => {
//     try {
//       await props.pageHistoryContainer.retrieveRevisions(selectedPage);
//     }
//     catch (err) {
//       toastError(err);
//       props.pageHistoryContainer.setState({ errorMessage: err.message });
//       logger.error(err);
//     }
//   }, [props.pageHistoryContainer]);

//   if (pageHistoryContainer.state.errorMessage != null) {
//     return (
//       <div className="my-5">
//         <div className="text-danger">{pageHistoryContainer.state.errorMessage}</div>
//       </div>
//     );
//   }

//   if (pageHistoryContainer.state.revisions === pageHistoryContainer.dummyRevisions) {
//     throw new Promise(async() => {
//       try {
//         await props.pageHistoryContainer.retrieveRevisions(1);
//       }
//       catch (err) {
//         toastError(err);
//         pageHistoryContainer.setState({ errorMessage: err.message });
//         logger.error(err);
//       }
//     });
//   }

//   return (
//     <div>
//       <PageRevisionList
//         pageHistoryContainer={pageHistoryContainer}
//         revisions={revisions}
//         diffOpened={diffOpened}
//         getPreviousRevision={getPreviousRevision}
//         onDiffOpenClicked={onDiffOpenClicked}
//       />
//       <PaginationWrapper
//         activePage={activePage}
//         changePage={handlePage}
//         totalItemsCount={totalPages}
//         pagingLimit={pagingLimit}
//         align="center"
//       />
//     </div>
//   );

// }

// const RenderPageHistoryWrapper = withUnstatedContainers(withLoadingSppiner(PageHistory), [PageHistroyContainer]);

// PageHistory.propTypes = {
//   pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
// };

// export default RenderPageHistoryWrapper;
