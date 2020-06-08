import React from 'react';
import PropTypes from 'prop-types';

import UserPictureList from './UserPictureList';

import { withUnstatedContainers } from '../UnstatedUtils';

import PageContainer from '../../services/PageContainer';

class SeenUserPictureList extends React.Component {

  render() {
    const { pageContainer } = this.props;
    return (
      <UserPictureList users={pageContainer.state.seenUsers} />
    );
  }

}

SeenUserPictureList.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SeenUserPictureListWrapper = withUnstatedContainers(SeenUserPictureList, [PageContainer]);

export default (SeenUserPictureListWrapper);
