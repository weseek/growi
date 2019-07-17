import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import PaginationWrapper from '../../PaginationWrapper';
import TableUserList from './TableUserList';

import AppContainer from '../../../services/AppContainer';
import { createSubscribedElement } from '../../UnstatedUtils';

class UserPage extends React.Component {

  constructor(props) {
    super();

  }

  render() {

    return (
      <Fragment>
        <TableUserList />
        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalUserGroups}
          pagingLimit={this.state.pagingLimit}
        >
        </PaginationWrapper>
      </Fragment>
    );
  }

}

const UserPageWrapper = (props) => {
  return createSubscribedElement(UserPage, props, [AppContainer]);
};

UserPage.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default UserPageWrapper;
