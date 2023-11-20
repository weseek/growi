import React from 'react';

import type { IUserHasId } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';
import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';

import type {
  IWorkflowHasId,
  IWorkflowApproverGroupHasId,
  IWorkflowApproverHasId,
} from '../../../interfaces/workflow';


/*
*  CreatorOrApproverItem
*/
const formatDate = (date: Date) => {
  return format(new Date(date), 'yyyy/MM/dd HH:mm');
};

type Creator = {
  user: IUserHasId
  workflowCreatedAt: Date
}

type CreatorOrApproverItemProps = {
  creator?: Creator
  approver?: IWorkflowApproverHasId
}

const CreatorOrApproverItem = (props: CreatorOrApproverItemProps): JSX.Element => {
  const { creator, approver } = props;
  const { t } = useTranslation();

  const user = approver?.user ?? creator?.user;

  if ((creator == null && approver == null) || (creator != null && approver != null)) {
    return <></>;
  }

  return (
    <>
      <div className="d-flex my-2 align-items-center">
        <div className="p-2">
          <UserPicture user={user} />
        </div>

        <div className="p-2">
          { user?.username }
        </div>

        <div className="ms-auto p-2 text-center">
          { creator != null && (
            <>
              <div>{t('approval_workflow.application')}</div>
              <div>{formatDate(creator.workflowCreatedAt)}</div>
            </>
          )}

          { approver != null && (
            <div>
              <div>{t(`approval_workflow.approver_status.${approver.status}`)}</div>
              <div>{formatDate(approver.updatedAt)}</div>
            </div>
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
    <div className="card rounded my-3">
      <div className="card-body">
        { approvers.map(approver => (
          <>
            <CreatorOrApproverItem
              key={approver._id}
              approver={approver}
            />
          </>
        ))}
      </div>
    </div>
  );
};


/*
*  CreatorCard
*/
type CreatorCardProps = {
  creator: Creator
}

const CreatorCard = (props: CreatorCardProps): JSX.Element => {
  const { creator } = props;

  return (
    <div className="card rounded my-3">
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

  const creator = {
    user: workflow.creator,
    workflowCreatedAt: workflow.createdAt,
  };

  return (
    <>
      <CreatorCard creator={creator} />

      {approverGroups.map(approverGroup => (
        <ApproverGroupCard
          key={approverGroup._id}
          approverGroup={approverGroup}
        />
      ))}
    </>
  );
};
