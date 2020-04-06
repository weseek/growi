import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';
import { userPageRoot } from '../../../../lib/util/path-utils';

const RevisionAuthor = (props) => {
  const { revisionAuthor, updatedAt } = props;
  const isCompactMode = true;
  const updateInfo = isCompactMode
    ? (<div>Updated in <span className="text-muted">{updatedAt}</span></div>)
    : (<div><div>Updated in  <a href={userPageRoot(revisionAuthor)}>{revisionAuthor.name}</a></div><div className="text-muted">{updatedAt}</div></div>);
  const pictureSize = isCompactMode ? 'xs' : 'sm';
  return (
    <div className="d-flex align-items-center">
      <div className="mr-2" href={userPageRoot(revisionAuthor)} data-toggle="tooltip" data-placement="bottom" title={revisionAuthor.name}>
        <UserPicture user={revisionAuthor} size={pictureSize} />
      </div>
      {updateInfo}
    </div>
  );
};

RevisionAuthor.propTypes = {

  revisionAuthor: PropTypes.object.isRequired,
  updatedAt: PropTypes.string.isRequired,
};


export default RevisionAuthor;
