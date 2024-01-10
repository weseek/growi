import { FC } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'react-i18next';

type Props = {
  approvedApproverIds?: string[]
  isEditable: boolean
  selectedUsers: IUserHasId[]
}

type ApprovedApproverCardProps = Omit<Props, 'selectedUsers'> & { userData: IUserHasId };

const ApprovedApproverCard: FC<ApprovedApproverCardProps> = (props) => {

  const {
    userData, approvedApproverIds, isEditable,
  } = props;

  const { t } = useTranslation();

  const isApproved = approvedApproverIds?.includes(userData._id);
  const isDisabled = !isEditable || isApproved;

  if (!isDisabled) {
    return <></>;
  }

  console.log(userData.username);

  return (
    <div className="p-2 border-secondary-subtle">
      <div className="row justify-content-center">
        <div className="col-1"></div>
        <div className="col-1">
          <span className="">
            <i className="icon-people" />
          </span>
        </div>
        <div className="col-5">{userData.username}</div>
        <div className="col-4 text-end">{t('approval_workflow.approver_status.APPROVE')}</div>
      </div>
    </div>
  );
};

export const ApprovedApproverCards: FC<Props> = (props) => {

  const {
    selectedUsers, approvedApproverIds, isEditable,
  } = props;

  const isSingleArray = selectedUsers.length === 1;

  const cardsStyle = isSingleArray ? 'rounded' : 'rounded-top';

  console.log(selectedUsers);

  return (
    <>
      <div className={`bg-secondary ${cardsStyle}`}>
        { selectedUsers.map(selectedUser => (
          <ApprovedApproverCard
            userData={selectedUser}
            approvedApproverIds={approvedApproverIds}
            isEditable={isEditable}
          />
        ))}
      </div>
    </>
  );

};
