import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import RevisionCompareContainer from '../services/RevisionCompareContainer';
import RevisionDiff from './PageHistory/RevisionDiff';

class PageCompare extends React.Component {
  componentWillMount() {
    const { revisionCompareContainer, fromRevisionId, toRevisionId } = this.props;

    revisionCompareContainer.fetchPageRevisionBody(fromRevisionId, toRevisionId);
  }

  render() {
    const { t, revisionCompareContainer } = this.props;

    const fromRev = revisionCompareContainer.state.fromRevision;
    const toRev = revisionCompareContainer.state.toRevision;
    const showDiff = (fromRev && toRev);

    return (
      <div id="revision-compare-content">
        <div>{ t('page_compare_revision.comparing_changes') }</div>
        <div class="card card-compare">
          <div class="card-body">
          { fromRev && fromRev._id }<i class="icon-arrow-right-circle mx-1"></i>{ toRev && toRev._id }
          </div>
        </div>
        { showDiff &&
          <RevisionDiff
            revisionDiffOpened={ true }
            previousRevision={ fromRev }
            currentRevision={ toRev }
          />
        }
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PageCompareWrapper = withUnstatedContainers(PageCompare, [RevisionCompareContainer]);

PageCompare.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,
  fromRevisionId: PropTypes.string,
  toRevisionId: PropTypes.string,
};

export default withTranslation()(PageCompareWrapper);
