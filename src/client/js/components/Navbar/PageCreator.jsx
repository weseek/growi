import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';
import { userPageRoot } from '../../../../lib/util/path-utils';

const PageCreator = (props) => {
  const { creator, createdAt } = props;
  const isCompactMode = true;
  const creatInfo = isCompactMode
    ? (<div>Created in <span className="text-muted">{createdAt}</span></div>)
    : (<div><div>Created by <a href={userPageRoot(creator)}>{creator.name}</a></div><div className="text-muted">{createdAt}</div></div>);
  const pictureSize = isCompactMode ? 'xs' : 'sm';

  return (
    <div className="d-flex align-items-center">
      <div className="mr-2" href={userPageRoot(creator)} data-toggle="tooltip" data-placement="bottom" title={creator.name}>
        <UserPicture user={creator} size={pictureSize} />
      </div>
      {creatInfo}
    </div>
  );
};

PageCreator.propTypes = {

  creator: PropTypes.object.isRequired,
  createdAt: PropTypes.string.isRequired,
};


export default PageCreator;
