import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip, Button } from 'reactstrap';
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
      const userTarget = <span id={`span-${user._id}`}><UserPicture user={user} size="xs" ref={`userPicture-${user._id}`} /></span>;

      return (
        <span>
          {/* workaround from https://github.com/react-bootstrap/react-bootstrap/issues/2208#issuecomment-301737531 */}
          {userTarget}
          <UncontrolledTooltip
            id={`tooltip-${user._id}`}
            placement="bottom"
            target={`span-${user._id}`}
          >
            @{user.username}<br />{user.name}
          </UncontrolledTooltip>
        </span>
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
