import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { UserPicture } from '@growi/ui';
import { pagePathUtils } from '@growi/core';

const { userPageRoot } = pagePathUtils;


const formatType = 'yyyy/MM/dd HH:mm';
const AuthorInfo = (props) => {
  const {
    mode, user, date, locate,
  } = props;

  const infoLabelForSubNav = mode === 'create'
    ? 'Created by'
    : 'Updated by';
  const nullinfoLabelForFooter = mode === 'create'
    ? 'Created by'
    : 'Updated by';
  const infoLabelForFooter = mode === 'create'
    ? 'Created at'
    : 'Last revision posted at';
  const userLabel = user != null
    ? <a href={userPageRoot(user)}>{user.name}</a>
    : <i>Unknown</i>;

  if (locate === 'footer') {
    try {
      return <p>{infoLabelForFooter} {format(new Date(date), formatType)} by <UserPicture user={user} size="sm" /> {userLabel}</p>;
    }
    catch (err) {
      if (err instanceof RangeError) {
        return <p>{nullinfoLabelForFooter} <UserPicture user={user} size="sm" /> {userLabel}</p>;
      }
      return <></>;
    }
  }

  const renderParsedDate = () => {
    try {
      return format(new Date(date), formatType);
    }
    catch (err) {
      return '';
    }
  };

  return (
    <div className="d-flex align-items-center">
      <div className="mr-2">
        <UserPicture user={user} size="sm" />
      </div>
      <div>
        <div>{infoLabelForSubNav} {userLabel}</div>
        <div className="text-muted text-date" data-hide-in-vrt>
          {renderParsedDate()}
        </div>
      </div>
    </div>
  );
};

AuthorInfo.propTypes = {
  date: PropTypes.instanceOf(Date),
  user: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'update']),
  locate: PropTypes.oneOf(['subnav', 'footer']),
};

AuthorInfo.defaultProps = {
  mode: 'create',
  locate: 'subnav',
};


export default AuthorInfo;
