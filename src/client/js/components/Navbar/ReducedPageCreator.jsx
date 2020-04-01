import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';
import { userPageRoot } from '../../../../lib/util/path-utils';

const ReducedPageCreator = (props) => {
  const { creator, createdAt } = props;

  return (
    <div className="d-flex align-items-center">
      <div className="mr-2" href={userPageRoot(creator)} data-toggle="tooltip" data-placement="bottom" title={creator.name}>
        <UserPicture user={creator} size="xs" />
      </div>
      <div>
        Created in <span className="text-muted">{createdAt}</span>
      </div>
    </div>
  );
};

ReducedPageCreator.propTypes = {
  creator: PropTypes.object.isRequired,
  createdAt: PropTypes.string.isRequired,
};


export default ReducedPageCreator;
