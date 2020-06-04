import React from 'react';
import PropTypes from 'prop-types';

import UserPictureList from './UserPictureList';

import { createSubscribedElement } from '../UnstatedUtils';

import PageContainer from '../../services/PageContainer';

class LikerPictureList extends React.Component {

  render() {
    const { pageContainer } = this.props;
    return (
      <UserPictureList users={pageContainer.state.likerUsers} />
    );
  }

}

LikerPictureList.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const LikerPictureListWrapper = (props) => {
  return createSubscribedElement(LikerPictureList, props, [PageContainer]);
};

export default (LikerPictureListWrapper);
