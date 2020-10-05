import React from 'react';
import PropTypes from 'prop-types';

import { userPageRoot } from '@commons/util/path-utils';

import UserPicture from '../User/UserPicture';

const AuthorInfo = (props) => {
  const { mode, user, date } = props;

  const infoLabel = mode === 'create'
    ? 'Created by'
    : 'Updated by';
  const userLabel = user != null
    ? <a href={userPageRoot(user)}>{user.name}</a>
    : <i>Unknown</i>;

  return (
    <div className="d-flex align-items-center">
      <div className="mr-2">
        <UserPicture user={user} size="sm" />
      </div>
      <div>
        <div>{infoLabel} {userLabel}</div>
        <div className="text-muted text-date">{date}</div>
      </div>
    </div>
  );
};

AuthorInfo.propTypes = {
  date: PropTypes.string.isRequired,
  user: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'update']),
};

AuthorInfo.defaultProps = {
  mode: 'create',
};


export default AuthorInfo;
