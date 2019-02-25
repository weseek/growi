import React from 'react';
import PropTypes from 'prop-types';

import UserPictureList from './Common/UserPictureList';

export default class UserCountAndList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    const userIds = this.props.userIds;

    if (userIds.length > 0) {
      // FIXME: user data cache
      this.setState({users: this.props.crowi.findUserByIds(userIds)});
    }
  }

  render() {
    return (
      <div className="user-list">
        <p className="user-count">
          {this.state.users.length}
        </p>
        <UserPictureList users={this.state.users} />
      </div>
    );
  }
}

UserCountAndList.propTypes = {
  crowi: PropTypes.object.isRequired,
  userIds: PropTypes.arrayOf(PropTypes.string),
};
UserCountAndList.defaultProps = {
  userIds: [],
};
