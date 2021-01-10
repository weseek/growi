import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

import { withUnstatedContainers } from '../UnstatedUtils';
import RevisionCompareContainer from '../../services/RevisionCompareContainer';

class RevisionIdForm extends React.Component {

  /**
   * create an Option array for AsyncSelect from the revision list
   */
  revisionOptions() {
    const { revisionCompareContainer } = this.props;
    const timeFormat = 'yyyy/MM/dd HH:mm:ss';

    return revisionCompareContainer.state.revisions.map((rev) => {
      return { label: `${format(new Date(rev.createdAt), timeFormat)} - ${rev._id}`, value: rev._id };
    });
  }

  /**
   * render a revision selector
   * @param {label} label text of inputbox
   */
  renderRevisionSelector(label) {
    if (['FromRev', 'ToRev'].indexOf(label) === -1) {
      return <></>;
    }
    const forFromRev = (label === 'FromRev');

    const { revisionCompareContainer } = this.props;
    const options = this.revisionOptions();
    const selectedRevisionId = (forFromRev ? revisionCompareContainer.state.fromRevision?._id : revisionCompareContainer.state.toRevision?._id);
    const value = options.find(it => it.value === selectedRevisionId);
    const changeHandler = (forFromRev ? revisionCompareContainer.handleFromRevisionChange : revisionCompareContainer.handleToRevisionChange);
    return (
      <ReactSelect
        options={options}
        onChange={selectedOption => changeHandler(selectedOption.value)}
        placeholder={label}
        value={value}
      />
    );
  }

  render() {
    const fromRevSelector = this.renderRevisionSelector('FromRev');
    const toRevSelector = this.renderRevisionSelector('ToRev');

    return (
      <div className="container-fluid px-0">
        <div className="row">
          <div className="mb-3 col-sm">
            { fromRevSelector }
          </div>
          <div className="mb-3 col-sm">
            { toRevSelector }
          </div>
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const RevisionIdFormWrapper = withUnstatedContainers(RevisionIdForm, [RevisionCompareContainer]);

/**
 * Properties
 */
RevisionIdForm.propTypes = {
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,
};

/**
 * Properties
 */
RevisionIdForm.defaultProps = {
};

export default RevisionIdFormWrapper;
