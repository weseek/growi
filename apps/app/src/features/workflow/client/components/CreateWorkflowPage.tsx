import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { useCreateWorkflow } from '~/features/workflow/client/services/workflow';
import { IWorkflowApproverGroupReq, WorkflowApprovalType, WorkflowApproverStatus } from '~/features/workflow/interfaces/workflow';

type Props = {
  pageId: string,
  onClickWorkflowListPageBackButton: () => void;
}

export const CreateWorkflowPage = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { pageId, onClickWorkflowListPageBackButton } = props;

  const approverGroupsDummyData = [{
    approvalType: WorkflowApprovalType.AND,
    approvers: [
      {
        user: '64e41166aa753ef87f073770',
        status: WorkflowApproverStatus.NONE,
      },
      {
        user: '64ec3bcd763893423f32b9dd',
        status: WorkflowApproverStatus.NONE,
      },
    ],
  }] as IWorkflowApproverGroupReq[];

  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowDescription, setWorkflowDescription] = useState<string>('');
  const [approverGroups, setApproverGroups] = useState<IWorkflowApproverGroupReq[] | undefined>(approverGroupsDummyData);

  const { createWorkflow } = useCreateWorkflow(pageId, workflowName, workflowDescription, approverGroups);

  const workflowNameChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(event.target.value);
  }, []);

  const workflowDescriptionChangeHandler = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWorkflowDescription(event.target.value);
  }, []);

  const workflowListPageBackButtonClickHandler = useCallback(() => {
    if (onClickWorkflowListPageBackButton == null) {
      return;
    }

    onClickWorkflowListPageBackButton();
  }, [onClickWorkflowListPageBackButton]);

  const createWorkflowButtonClickHandler = useCallback(async() => {
    if (approverGroups == null) {
      return;
    }

    try {
      await createWorkflow();
      // TODO: Move to the detail screen
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [approverGroups, createWorkflow]);

  return (
    <>
      <ModalHeader className="bg-primary">
        {t('approval_workflow.create_new')}
      </ModalHeader>

      <ModalBody>

        <div className="row align-items-center">
          <label htmlFor="name" className="col-md-4 col-form-label">
            {t('approval_workflow.name')}
          </label>
          <div className="col-md-8 mb-3">
            <div className="row">
              <div className="col">
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={workflowName}
                  onChange={workflowNameChangeHandler}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <label htmlFor="description" className="col-md-4 col-form-label">
            {t('approval_workflow.description')}
          </label>
          <div className="col-md-8">
            <div className="row">
              <div className="col">
                <textarea
                  className="form-control"
                  name="description"
                  value={workflowDescription}
                  onChange={workflowDescriptionChangeHandler}
                />
              </div>
            </div>
          </div>
        </div>

      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={createWorkflowButtonClickHandler}>
          {t('approval_workflow.create')}
        </button>

        <button type="button" onClick={workflowListPageBackButtonClickHandler}>
          {t('approval_workflow.back')}
        </button>
      </ModalFooter>
    </>
  );
};
