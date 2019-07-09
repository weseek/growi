import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class FullTextSearchManagement extends React.Component {

  constructor(props) {
    super(props);

    this.Buildindex = this.Buildindex.bind(this);
  }

  Buildindex(event) {

    const { appContainer } = this.props;
    const pageId = this.props.pageId;

    appContainer.apiPost('/admin/search/build', { page_id: pageId })
  }

  render() {
    return (
      <Fragment>
        <div>
          <button type="submit" className="btn btn-inverse" onClick={this.Buildindex}>Build Now</button>
        </div>
      </Fragment>
    );
  }

}

const FullTextSearchManagementWrapper = (props) => {
  return createSubscribedElement(FullTextSearchManagement, props, [AppContainer]);
};

FullTextSearchManagement.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default FullTextSearchManagementWrapper;
