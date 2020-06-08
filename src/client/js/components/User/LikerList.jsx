import React from 'react';
import PropTypes from 'prop-types';

import UserPictureList from './UserPictureList';

import { withUnstatedContainers } from '../UnstatedUtils';

import PageContainer from '../../services/PageContainer';

class LikerList extends React.Component {

  render() {
    const { pageContainer } = this.props;
    return (
      // <div className="text-truncate text-muted text-right" style="direction: rtl;">
      <div className="text-truncate text-muted text-right">
        <span className="text-info">
          <span className="liker-user-count">{pageContainer.state.sumOfLikers}</span>
          <i className="icon-fw icon-like"></i>
        </span>
        <UserPictureList users={pageContainer.state.likerUsers} />
      </div>
    );
  }

}

LikerList.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const LikerPictureListWrapper = withUnstatedContainers(LikerList, [PageContainer]);

export default (LikerPictureListWrapper);
