import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import NewUsers from './NewUsers';
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
        <NewUsers />
        <TableUserList />
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
