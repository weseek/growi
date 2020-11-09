import React from 'react';
import PropTypes from 'prop-types';

import { userPageRoot } from '~/utils/path-utils';

import UserPicture from '../User/UserPicture';

const AuthorInfo = (props) => {
  const {
    mode, user, date, locate,
  } = props;

  const infoLabelForSubNav = mode === 'create'
    ? 'Created by'
    : 'Updated by';
  const infoLabelForFooter = mode === 'create'
    ? 'Last revision posted at'
    : 'Created at';
  const userLabel = user != null
    ? <a href={userPageRoot(user)}>{user.name}</a>
    : <i>Unknown</i>;

  if (locate === 'footer') {
    return <p>{infoLabelForFooter} {date} by <UserPicture user={user} size="sm" /> {userLabel}</p>;
  }

  return (
    <div className="d-flex align-items-center">
      <div className="mr-2">
        <UserPicture user={user} size="sm" />
      </div>
      <div>
        <div>{infoLabelForSubNav} {userLabel}</div>
        <div className="text-muted text-date">{date}</div>
      </div>
    </div>
  );
};

AuthorInfo.propTypes = {
  date: PropTypes.string.isRequired,
  user: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'update']),
  locate: PropTypes.oneOf(['subnav', 'footer']),
};

AuthorInfo.defaultProps = {
  mode: 'create',
  locate: 'subnav',
};


export default AuthorInfo;
