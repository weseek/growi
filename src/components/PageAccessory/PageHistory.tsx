import React, { useCallback, FC } from 'react';
import loggerFactory from '@alias/logger';

// import { withUnstatedContainers } from './UnstatedUtils';
// import { toastError } from '../util/apiNotification';

// import { withLoadingSppiner } from './SuspenseUtils';
// import PageRevisionList from './PageHistory/PageRevisionList';

// import PageHistroyContainer from '../services/PageHistoryContainer';
// import PaginationWrapper from './PaginationWrapper';

import { useCurrentPageHistorySWR } from '~/stores/page';

const logger = loggerFactory('growi:PageHistory');

export const PageHistory:FC = () => {
  const { data } = useCurrentPageHistorySWR(1, 100);
  console.log(data);
  return <p>hoge</p>;
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
