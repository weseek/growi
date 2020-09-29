import React from 'react';
import PropTypes from 'prop-types';

import PageContainer from '../../services/PageContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import UserPicture from './UserPicture';

const UserInfo = (props) => {

  const { pageContainer } = props;
  const pageUser = pageContainer.state.pageUser;

  return (
    <div className="grw-users-info d-flex align-items-center d-edit-none">
      <UserPicture user={pageUser} />

      <div className="users-meta">
        <h1 className="user-page-name">
          {pageUser.name}
        </h1>
        <div className="user-page-meta mt-3 mb-0">
          <span className="user-page-username mr-4"><i className="icon-user mr-1"></i>{pageUser.username}</span>
          <span className="user-page-email mr-2">
            <i className="icon-envelope mr-1"></i>
            {pageUser.isEmailPublished ? pageUser.email : '*****'}
          </span>
          {pageUser.introduction && <span className="user-page-introduction">{pageUser.introduction}</span>}
        </div>
      </div>

    </div>
  );
};


UserInfo.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

const UserInfoWrapper = withUnstatedContainers(UserInfo, [PageContainer]);

export default UserInfoWrapper;
