import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';
import { userPageRoot } from '../../../../lib/util/path-utils';

const ReducedRevisionAuthor = (props) => {
  const { revisionAuthor, updatedAt } = props;

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
};

ReducedRevisionAuthor.propTypes = {

  revisionAuthor: PropTypes.object.isRequired,
  updatedAt: PropTypes.string.isRequired,
};


export default ReducedRevisionAuthor;
