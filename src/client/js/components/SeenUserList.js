import React from 'react';
import PropTypes from 'prop-types';

import UserList from './SeenUserList/UserList';

export default class SeenUserList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      seenUsers: [],
    };
  }

  componentDidMount() {
    const seenUserIds = this.props.seenUserIds;

    if (seenUserIds.length > 0) {
      // FIXME: user data cache
      this.setState({seenUsers: this.props.crowi.findUserByIds(seenUserIds)});
    }
  }

  render() {
    return (
      <div className="seen-user-list">
        <p className="seen-user-count">
          {this.state.seenUsers.length}
        </p>
        <UserList users={this.state.seenUsers} />
      </div>
    );
  }
}

SeenUserList.propTypes = {
  crowi: PropTypes.object.isRequired,
  seenUserIds: PropTypes.arrayOf(PropTypes.string),
};
SeenUserList.defaultProps = {
  seenUserIds: [],
};
