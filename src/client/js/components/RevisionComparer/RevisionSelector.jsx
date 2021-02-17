import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import { withLoadingSppiner } from '../SuspenseUtils';

import RevisionComparerContainer from '../../services/RevisionComparerContainer';

const RevisionSelector = (props) => {

  const { revision, hasDiff, revisionComparerContainer } = props;
  const { sourceRevision, targetRevision } = revisionComparerContainer.state;

  if (!hasDiff) {
    return <></>;
  }

  return (
    <React.Fragment>
      <div className="container-fluid px-0">
        <div className="row no-gutters">
          <div className="col text-center">
            <div className="custom-control custom-radio custom-control-inline mr-0">
              <input
                type="radio"
                className="custom-control-input"
                id={`compareSource-${revision._id}`}
                name="compareSource"
                value={revision._id}
                checked={revision._id === sourceRevision?._id}
                onChange={() => revisionComparerContainer.setState({ sourceRevision: revision })}
              />
              <label className="custom-control-label" htmlFor={`compareSource-${revision._id}`} />
            </div>
          </div>
          <div className="col text-center">
            <div className="custom-control custom-radio custom-control-inline mr-0">
              <input
                type="radio"
                className="custom-control-input"
                id={`compareTarget-${revision._id}`}
                name="compareTarget"
                value={revision._id}
                checked={revision._id === targetRevision?._id}
                onChange={() => revisionComparerContainer.setState({ targetRevision: revision })}
              />
              <label className="custom-control-label" htmlFor={`compareTarget-${revision._id}`} />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );

};

const RevisionSelectorWrapper = withUnstatedContainers(withLoadingSppiner(RevisionSelector), [RevisionComparerContainer]);

RevisionSelector.propTypes = {
  revisionComparerContainer: PropTypes.instanceOf(RevisionComparerContainer).isRequired,

  revision: PropTypes.object,
  hasDiff: PropTypes.bool.isRequired,
};

export default RevisionSelectorWrapper;
