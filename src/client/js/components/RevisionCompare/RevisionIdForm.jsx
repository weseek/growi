import React from 'react';
import AsyncSelect from 'react-select/async';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import RevisionCompareContainer from '../../services/RevisionCompareContainer';

class RevisionIdForm extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
    };

    this.loadFilteredRevisionOptions = this.loadFilteredRevisionOptions.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  loadFilteredRevisionOptions(inputText, callback) {
    const { revisionCompareContainer } = this.props;
    const revisionOptions = revisionCompareContainer.state.recentRevisions.map(rev => {
      return { label: rev._id, value: rev._id };
    });
    const filteredRevisionOptions = revisionOptions.filter(rev =>
      rev.label.toLowerCase().includes(inputText.toLowerCase())
    );

    return callback(filteredRevisionOptions);
  }

  /**
   * render a row (Revision component and RevisionDiff component)
   * @param {label} label text of inputbox
   */
  renderRevisionSelector(label) {
    if (["FromRev", "ToRev"].indexOf(label) === -1) {
      return <div></div>
    }

    const { revisionCompareContainer } = this.props;
    const changeHandler = (label === "FromRev" ? revisionCompareContainer.handleFromRevisionChange : revisionCompareContainer.handleToRevisionChange);
    return (
      <div class="input-group mb-3 col-sm">
        <div class="input-group-prepend">
          <label class="input-group-text" for="inputGroupSelect01">{ label }</label>
        </div>
        <AsyncSelect
          cacheOptions
          loadOptions={this.loadFilteredRevisionOptions}
          defaultOptions
          onChange={(selectedOption) => changeHandler(selectedOption.value)}
        />
      </div>
    );
  }

  render() {
    const fromRevSelector = this.renderRevisionSelector("FromRev");
    const toRevSelector = this.renderRevisionSelector("ToRev");

    return (
      <div class="container-fluid px-0">
        <div class="row">
          { fromRevSelector }
          { toRevSelector }
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
