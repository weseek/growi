import React from 'react';

import type { IUserHasId } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';

import type {
  IWorkflowHasId,
  IWorkflowApproverGroupHasId,
  IWorkflowApproverHasId,
} from '../../../interfaces/workflow';


/*
*  ApproverItem
*/
type CreatorOrApproverItemProps = {
  creator?: IUserHasId
  approver?: IWorkflowApproverHasId
}

const CreatorOrApproverItem = (props: CreatorOrApproverItemProps): JSX.Element => {
  const { approver, creator } = props;
  const { t } = useTranslation();

  const user = approver?.user ?? creator ?? undefined;

  if ((creator == null && approver == null) && (creator != null && approver != null)) {
    return <></>;
  }

  return (
    <>
      <div className="d-flex my-2">
        <div className="p-2">
          <UserPicture user={user} />
        </div>

        <div className="p-2">
          { user?.username }
        </div>

        <div className="ms-auto p-2">
          { creator != null && (
            <>{t('approval_workflow.application')}</>
          )}

          { approver != null && (
            <>{ t(`approval_workflow.approver_status.${approver?.status}`)}</>
          )}
        </div>
      </div>
    </>
  );
};


/*
*  ApproverGroupCard
*/
type ApproverGroupCardProps = {
  approverGroup: IWorkflowApproverGroupHasId
}

const ApproverGroupCard = (props: ApproverGroupCardProps): JSX.Element => {
  const { approverGroup } = props;

  const approvers = approverGroup.approvers;

  return (
    <div className="card rounded  my-2">
      <div className="card-body">
        { approvers.map(approver => (
          <CreatorOrApproverItem
            key={approver._id}
            approver={approver}
          />
        ))}
      </div>
    </div>
  );
};


/*
*  CreatorCard
*/
type CreatorCardProps = {
  creator: IUserHasId;
}

const CreatorCard = (props: CreatorCardProps): JSX.Element => {
  const { creator } = props;

  return (
    <div className="card rounded  my-2">
      <div className="card-body">
        <CreatorOrApproverItem creator={creator} />
      </div>
    </div>
  );
};


/*
*  ApproverGroupCards
*/
type ApproverGroupCardsProps = {
  workflow: IWorkflowHasId;
};

export const ApproverGroupCards = (props: ApproverGroupCardsProps): JSX.Element => {
  const { workflow } = props;

  const approverGroups = workflow.approverGroups;

  return (
    <>
      <CreatorCard creator={workflow.creator} />

      {approverGroups.map(approverGroup => (
        <ApproverGroupCard
          key={approverGroup._id}
          approverGroup={approverGroup}
        />
      ))}
    </>
  );
};
