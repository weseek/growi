import React from 'react';
import PropTypes from 'prop-types';

import UserPictureList from './UserPictureList';

import { withUnstatedContainers } from '../UnstatedUtils';

import PageContainer from '../../services/PageContainer';

import FootstampIcon from '../FootstampIcon';

class SeenUserList extends React.Component {

  render() {
    const { pageContainer } = this.props;
    return (
      <button type="button" className="btn btn-seen-user-list border-0 px-1 py-0" data-container="body" data-toggle="popover" data-placement="bottom" data-html="true" data-content_div_id="seen-user-content">
        <span className="mr-2 svg footstamp-icon"><FootstampIcon /></span>
        <span className="seen-user-count">{pageContainer.state.countOfSeenUsers}</span>
        <div id="seen-user-content" className="hide px-2 text-right user-list-content text-truncate text-muted">
          <UserPictureList users={pageContainer.state.seenUsers} />
        </div>
      </button>
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
