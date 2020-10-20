// import React from 'react';
import PropTypes from 'prop-types';

import React, { useState } from 'react';
import {
  Button, Popover, PopoverBody,
} from 'reactstrap';
import UserPictureList from './UserPictureList';

import { withUnstatedContainers } from '../UnstatedUtils';

import PageContainer from '../../services/PageContainer';

import FootstampIcon from '../FootstampIcon';

/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

const SeenUserList = (props) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const toggle = () => setPopoverOpen(!popoverOpen);
  const { pageContainer } = props;
  return (
    <>
      <Button id="po-seen-user" color="link" className="px-2">
        <span className="mr-1 footstamp-icon"><FootstampIcon /></span>
        <span className="seen-user-count">{pageContainer.state.countOfSeenUsers}</span>
      </Button>
      <Popover placement="bottom" isOpen={popoverOpen} target="po-seen-user" toggle={toggle} trigger="legacy">
        <PopoverBody className="seen-user-popover">
          <div className="px-2 text-right user-list-content text-truncate text-muted">
            <UserPictureList users={pageContainer.state.seenUsers} />
          </div>
        </PopoverBody>
      </Popover>
    </>
  );
};

SeenUserList.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SeenUserListWrapper = withUnstatedContainers(SeenUserList, [PageContainer]);

export default (SeenUserListWrapper);
