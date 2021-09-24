import React from 'react';
import PropTypes from 'prop-types';

import { UserPicture } from '@growi/ui';

const UserInfo = (props) => {
  const { pageUser } = props;

  // do not display when the user does not exist
  if (pageUser == null) {
    return null;
  }

  return (
    <div className="grw-users-info d-flex align-items-center d-edit-none mb-5 pb-3 border-bottom">
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
  pageUser: PropTypes.object,
};

export default UserInfo;
