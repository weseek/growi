import React from 'react';
import PropTypes from 'prop-types';

import UserPictureList from './UserPictureList';

import { withUnstatedContainers } from '../UnstatedUtils';

import PageContainer from '../../services/PageContainer';

class SeenUserList extends React.Component {

  render() {
    const { pageContainer } = this.props;
    return (
      <div className="user-list-content text-truncate text-muted text-right">
        <span className="text-danger">
          <span className="seen-user-count">{pageContainer.state.countOfSeenUsers}</span>
          <i className="fa fa-fw fa-paw"></i>
        </span>
        <span className="mr-1">
          <UserPictureList users={pageContainer.state.seenUsers} />
        </span>
      </div>
    );
  }

}

SeenUserList.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SeenUserListWrapper = withUnstatedContainers(SeenUserList, [PageContainer]);

export default (SeenUserListWrapper);
