import { FC } from 'react';

import type { IUserHasId } from '@growi/core';

type Props = {
  userData: IUserHasId
  approvedApproverIds?: string[]
  isEditable: boolean
}

export const ApprovedApproverCard: FC<Props> = (props) => {

  const { userData, approvedApproverIds, isEditable } = props;

  const isApproved = approvedApproverIds?.includes(userData._id);
  const isDisabled = !isEditable || isApproved;

  if (!isDisabled) {
    return <></>;
  }

  console.log(userData.username);

  return (
    <div className="bg-secondary">
      <div className="row">
        <div className="col-1">
          <span className="">
            <i className="icon-people" />
          </span>
        </div>
        <div className="col-5">{userData.username}</div>
        <div className="col-6 text-end">Approved</div>
      </div>
    </div>
  );
};
