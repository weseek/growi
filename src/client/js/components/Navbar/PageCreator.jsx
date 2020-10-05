import React from 'react';
import PropTypes from 'prop-types';

import { userPageRoot } from '@commons/util/path-utils';

import UserPicture from '../User/UserPicture';

const LabelNormal = ({ mode, user, date }) => {
  const infoLabel = mode === 'create'
    ? 'Created by'
    : 'Updated by';
  const userLabel = user != null
    ? <a href={userPageRoot(user)}>{user.name}</a>
    : <i>Unknown</i>;

  return (
    <div>
      <div>{infoLabel} {userLabel}</div>
      <div className="text-muted text-date">{date}</div>
    </div>
  );
};

const LabelCompact = ({ mode, date }) => {
  const infoLabel = mode === 'create'
    ? 'Created at'
    : 'Updated at';

  return <div>{infoLabel} <span className="text-muted">{date}</span></div>;
};

const PageCreator = (props) => {
  const { user, isCompactMode } = props;

  const Label = isCompactMode ? LabelCompact : LabelNormal;
  const pictureSize = isCompactMode ? 'xs' : 'sm';

  return (
    <div className="d-flex align-items-center">
      <div className="mr-2">
        <UserPicture user={user} size={pictureSize} />
      </div>
      <Label {...props} />
    </div>
  );
};

PageCreator.propTypes = {
  date: PropTypes.string.isRequired,
  user: PropTypes.object,
  mode: PropTypes.oneOf('create', 'update'),
  isCompactMode: PropTypes.bool,
};
LabelNormal.propTypes = PageCreator.propTypes;
LabelCompact.propTypes = PageCreator.propTypes;

PageCreator.defaultProps = {
  mode: 'create',
  isCompactMode: false,
};


export default PageCreator;
