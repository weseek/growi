import React from 'react';
import PropTypes from 'prop-types';

// TODO: GW-333
// import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
// import Tooltip from 'react-bootstrap/es/Tooltip';

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
    const users = this.state.users.map((user) => {
      // create Tooltip
      const tooltip = <Tooltip id={`tooltip-${user._id}`}>@{user.username}<br />{user.name}</Tooltip>;

      return (
        <OverlayTrigger key={user._id} overlay={tooltip} placement="bottom">
          <span key={`span-${user._id}`}>{/* workaround from https://github.com/react-bootstrap/react-bootstrap/issues/2208#issuecomment-301737531 */}
            <UserPicture user={user} size="xs" ref={`userPicture-${user._id}`} />
          </span>
        </OverlayTrigger>
      );
    });

    return (
      <span>
        {users}
      </span>
    );
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
