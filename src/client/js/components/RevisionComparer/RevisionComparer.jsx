import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from '../UnstatedUtils';
import RevisionComparerContainer from '../../services/RevisionComparerContainer';
import RevisionDiff from '../PageHistory/RevisionDiff';

const RevisionComparer = (props) => {

  const { t, revisionComparerContainer } = props;
  const { sourceRevision, targetRevision } = revisionComparerContainer.state;
  const showDiff = (sourceRevision && targetRevision);

  return (
    <div className="revision-compare">
      <div className="d-flex">
        <h4 className="align-self-center">{ t('page_history.comparing_revisions') }</h4>
      </div>

      <div className="revision-compare-outer">
        { showDiff && (
          <RevisionDiff
            revisionDiffOpened
            previousRevision={sourceRevision}
            currentRevision={targetRevision}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const RevisionComparerWrapper = withUnstatedContainers(RevisionComparer, [RevisionComparerContainer]);

RevisionComparer.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revisionComparerContainer: PropTypes.instanceOf(RevisionComparerContainer).isRequired,

  revisions: PropTypes.array,
};

export default withTranslation()(RevisionComparerWrapper);
