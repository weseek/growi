import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import AppContainer from '../../../services/AppContainer';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';


class FullTextSearchManagement extends React.Component {

  constructor(props) {
    super(props);

    this.Buildindex = this.Buildindex.bind(this);
  }

  Buildindex() {

    const { appContainer } = this.props;
    const pageId = this.pageId;

    appContainer.apiPost('/admin/search/build', { page_id: pageId }).then((res) => {
      toastSuccess('Building request is successfully posted.');
    })
      .catch((e) => {
        toastError(new Error('エラーが発生しました'));
      });
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
