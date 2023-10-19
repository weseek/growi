import React, { useState, useCallback } from 'react';


import { useTranslation } from 'next-i18next';

import { WorkflowApprovalType, IWorkflowApproverGroupReq } from '../../../interfaces/workflow';

export const ApproverGroupCard = (): JSX.Element => {
  const { t } = useTranslation();

  const [approvalType, setApprovalType] = useState<WorkflowApprovalType>(WorkflowApprovalType.AND);

  const changeApprovalTypeButtonClickHandler = useCallback(() => {
    setApprovalType(approvalType === WorkflowApprovalType.AND ? WorkflowApprovalType.OR : WorkflowApprovalType.AND);
  }, [approvalType]);

  return (
    <div className="card rounded">
      <div className="card-body">
        <div className="text-muted">
          <i className="fa fa-user" />
        </div>

        <div className="dropdown">
          <a className="btn btn-light btn-sm rounded-pill dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            {t(`approval_workflow.approval_type.${approvalType}`)}
          </a>
          <ul className="dropdown-menu" onClick={() => changeApprovalTypeButtonClickHandler()}>
            { approvalType === WorkflowApprovalType.AND
              ? <>{t('approval_workflow.approval_type.OR')}</>
              : <>{t('approval_workflow.approval_type.AND')}</>
            }
          </ul>
        </div>

        完了条件
      </div>
    </div>
  );
};
