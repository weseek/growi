import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import { withLoadingSppiner } from '../SuspenseUtils';

import RevisionCompareContainer from '../../services/RevisionCompareContainer';

const RevisionSelector = (props) => {

  const { revision, hasDiff, revisionCompareContainer } = props;
  const { fromRevision, toRevision } = revisionCompareContainer.state;

  if (!hasDiff) {
    return <></>;
  }

  return (
    <React.Fragment>
      <div className="custom-control custom-radio custom-control-inline">
        <input
          type="radio"
          className="custom-control-input"
          id={`compareSource-${revision._id}`}
          name="compareSource"
          value={revision._id}
          checked={revision._id === fromRevision?._id}
          onChange={() => revisionCompareContainer.setState({fromRevision: revision})}
        />
        <label className="custom-control-label" htmlFor={`compareSource-${revision._id}`} />
      </div>
      <div className="custom-control custom-radio custom-control-inline">
        <input
          type="radio"
          className="custom-control-input"
          id={`compareTarget-${revision._id}`}
          name="compareTarget"
          value={revision._id}
          checked={revision._id === toRevision?._id}
          onChange={() => revisionCompareContainer.setState({toRevision: revision})}
          disabled={revisionCompareContainer.state.compareWithLatest}
        />
        <label className="custom-control-label" htmlFor={`compareTarget-${revision._id}`} />
      </div>
    </React.Fragment>
  );

}

const RevisionSelectorWrapper = withUnstatedContainers(withLoadingSppiner(RevisionSelector), [RevisionCompareContainer]);

RevisionSelector.propTypes = {
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,

  revision: PropTypes.object,
  hasDiff: PropTypes.bool.isRequired,
};

export default RevisionSelectorWrapper;
