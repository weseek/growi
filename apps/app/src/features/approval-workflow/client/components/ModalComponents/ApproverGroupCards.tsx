import React from 'react';

import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';


import {
  IWorkflowHasId,
  IWorkflowApproverGroupHasId,
  IWorkflowApproverHasId,
} from '../../../interfaces/workflow';


type ApproverItemProps = {
  approver: IWorkflowApproverHasId
}

const ApproverItem = (props: ApproverItemProps): JSX.Element => {
  const { approver } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="container my-2">
        <div className="row">
          <div className="col-4">
            <UserPicture user={approver.user} />
          </div>
          <div className="col-4">
            { approver.user.username }
          </div>
          <div className="col-4">
            { t(`approval_workflow.approver_status.${approver.status}`)}
          </div>
        </div>
      </div>
    </>
  );
};


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
          <ApproverItem
            key={approver._id}
            approver={approver}
          />
        ))}
      </div>
    </div>
  );
};


type ApproverGroupCardsProps = {
  workflow: IWorkflowHasId;
};

export const ApproverGroupCards = (props: ApproverGroupCardsProps): JSX.Element => {
  const { workflow } = props;

  const approverGroups = workflow.approverGroups;


  return (
    <>
      {approverGroups.map(approverGroup => (
        <ApproverGroupCard
          key={approverGroup._id}
          approverGroup={approverGroup}
        />
      ))}
    </>
  );
};
