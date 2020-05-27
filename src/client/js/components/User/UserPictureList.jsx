import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import UserPicture from './UserPicture';

class UserPictureList extends React.Component {

  constructor(props) {
    super(props);

    const userIds = this.props.userIds;

    const users = this.props.users.concat(
      // FIXME: user data cache
      this.props.appContainer.findUserByIds(userIds),
    );

    this.state = {
      users,
    };

  }

  render() {
    return this.state.users.map(user => (
      <span key={user._id}>
        <UserPicture user={user} size="xs" />
      </span>
    ));
  }

}

/**
 * Wrapper component for using unstated
 */
const UserPictureListWrapper = (props) => {
  return createSubscribedElement(UserPictureList, props, [AppContainer]);
};

UserPictureList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  userIds: PropTypes.arrayOf(PropTypes.string),
  users: PropTypes.arrayOf(PropTypes.object),
};

UserPictureList.defaultProps = {
  userIds: [],
  users: [],
};

export default UserPictureListWrapper;
