import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';
import { userPageRoot } from '../../../../lib/util/path-utils';

const RevisionAuthor = (props) => {
  const { revisionAuthor, updatedAt } = props;
  const isCompactMode = true;
  if (isCompactMode) {
    return (
      <div className="d-flex align-items-center">
        <div className="mr-2" href={userPageRoot(revisionAuthor)} data-toggle="tooltip" data-placement="bottom" title={revisionAuthor.name}>
          <UserPicture user={revisionAuthor} size="xs" />
        </div>
        <div>
          Updated in <span className="text-muted">{updatedAt}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="d-flex align-items-center">
      <div className="mr-2" href={userPageRoot(revisionAuthor)} data-toggle="tooltip" data-placement="bottom" title={revisionAuthor.name}>
        <UserPicture user={revisionAuthor} size="sm" />
      </div>
      <div>
        <div>Updated by  <a href={userPageRoot(revisionAuthor)}>{revisionAuthor.name}</a></div>
        <div className="text-muted">{updatedAt}</div>
      </div>
    </div>
  );
};

RevisionAuthor.propTypes = {

  revisionAuthor: PropTypes.object.isRequired,
  updatedAt: PropTypes.string.isRequired,
};


export default RevisionAuthor;
