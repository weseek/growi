import React from 'react';
import PropTypes from 'prop-types';

import { userPageRoot } from '@commons/util/path-utils';

import UserPicture from '../User/UserPicture';

const RevisionAuthor = (props) => {
  const { revisionAuthor, updatedAt, isCompactMode } = props;
  const updateInfo = isCompactMode
    ? (<div>Updated at <span className="text-muted">{updatedAt}</span></div>)
    : (<div><div>Updated by  <a href={userPageRoot(revisionAuthor)}>{revisionAuthor.name}</a></div><div className="text-muted">{updatedAt}</div></div>);
  const pictureSize = isCompactMode ? 'xs' : 'sm';

  return (
    <div className="d-flex align-items-center">
      <div className="mr-2">
        <UserPicture user={revisionAuthor} size={pictureSize} />
      </div>
      {updateInfo}
    </div>
  );
};

RevisionAuthor.propTypes = {

  revisionAuthor: PropTypes.object.isRequired,
  updatedAt: PropTypes.string.isRequired,
  isCompactMode: PropTypes.bool,
};

RevisionAuthor.defaultProps = {
  isCompactMode: false,
};

export default RevisionAuthor;
