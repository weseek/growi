import React from 'react';
import PropTypes from 'prop-types';

import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
import Tooltip from 'react-bootstrap/es/Tooltip';

import UserPicture from '../User/UserPicture';

export default class UserPictureList extends React.Component {

  constructor(props) {
    super(props);

    const userIds = this.props.userIds;

    const users = this.props.users.concat(
      // FIXME: user data cache
      this.props.crowi.findUserByIds(userIds),
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
        <a key={user._id} data-user-id={user._id} href={`/user/${user.username}`}>
          <OverlayTrigger overlay={tooltip} placement="bottom">
            <span key={`span-${user._id}`}>{/* workaround from https://github.com/react-bootstrap/react-bootstrap/issues/2208#issuecomment-301737531 */}
              <UserPicture user={user} size="xs" ref={`userPicture-${user._id}`} />
            </span>
          </OverlayTrigger>
        </a>
      );
    });

    return (
      <span>
        {users}
      </span>
    );
  }

}

UserPictureList.propTypes = {
  crowi: PropTypes.object.isRequired,
  userIds: PropTypes.arrayOf(PropTypes.string),
  users: PropTypes.arrayOf(PropTypes.object),
};

UserPictureList.defaultProps = {
  userIds: [],
  users: [],
};
