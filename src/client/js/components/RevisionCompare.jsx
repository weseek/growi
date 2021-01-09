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
    revisionCompareContainer.fetchPageRevisions();
  }

  /**
   * render a row (Revision component and RevisionDiff component)
   * @param {Revision} revisionSelected
   * @param {Array} revisionList
   */
  renderRevisionSelector(label) {
    if (["FromRev", "ToRev"].indexOf(label) === -1) {
      return <div></div>
    }

    const { revisionCompareContainer } = this.props;
    const selectedRev = (label === "FromRev" ? revisionCompareContainer.state.fromRevision : revisionCompareContainer.state.toRevision);
    const changeHandler = (label === "FromRev" ? revisionCompareContainer.handleFromRevisionChange : revisionCompareContainer.handleToRevisionChange);
    return (
      <div class="input-group mb-3 col-sm">
        <div class="input-group-prepend">
          <label class="input-group-text" for="inputGroupSelect01">{ label }</label>
        </div>
        <select class="custom-select" id="inputGroupSelect01" value={selectedRev ? selectedRev._id : ""} onChange={e => changeHandler(e.target.value)}>
          {
            revisionCompareContainer.state.recentRevisions.map(rev => (
              <option key={rev._id} value={rev._id}>{ rev._id }</option>
            ))
          }
        </select>
      </div>
    );
  }

  render() {
    const { t, revisionCompareContainer } = this.props;

    const fromRev = revisionCompareContainer.state.fromRevision;
    const toRev = revisionCompareContainer.state.toRevision;
    const showDiff = (fromRev && toRev);

    const fromRevSelector = this.renderRevisionSelector("FromRev");
    const toRevSelector = this.renderRevisionSelector("ToRev");

    return (
      <div id="revision-compare-content">
        <div>{ t('page_compare_revision.comparing_changes') }</div>
        <div class="container">
          <div class="row">
            { fromRevSelector }
            { toRevSelector }
          </div>
        </div>
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
