import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { withUnstatedContainers } from '../UnstatedUtils';
import RevisionComparerContainer from '../../services/RevisionComparerContainer';
import RevisionDiff from '../PageHistory/RevisionDiff';

function encodeSpaces(str) {
  if (str == null) {
    return null;
  }

  // Encode SPACE and IDEOGRAPHIC SPACE
  return str.replace(/ /g, '%20').replace(/\u3000/g, '%E3%80%80');
}

const RevisionComparer = (props) => {

  const { t, revisionComparerContainer } = props;

  const pagePathUrl = () => {
    const { origin } = window.location;
    const { path } = revisionComparerContainer.pageContainer.state;
    const { sourceRevision, targetRevision } = revisionComparerContainer.state;

    const urlParams = (sourceRevision && targetRevision ? `?compare=${sourceRevision._id}...${targetRevision._id}` : '');
    return encodeSpaces(decodeURI(`${origin}/${path}${urlParams}`));
  };

  const { sourceRevision, targetRevision } = revisionComparerContainer.state;
  const showDiff = (sourceRevision && targetRevision);

  return (
    <div className="revision-compare">
      <div className="d-flex">
        <h4 className="align-self-center">{ t('page_history.comparing_revisions') }</h4>
        {/* Page path URL */}
        <CopyToClipboard text={pagePathUrl()} />
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
