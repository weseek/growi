// TODO: https://redmine.weseek.co.jp/issues/130338
import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';

import { IWorkflowApproverGroupReq, WorkflowApprovalType, WorkflowApproverStatus } from '../../../interfaces/workflow';
import { useSWRMUTxCreateWorkflow } from '../../stores/workflow';

import { WorkflowModalHeader } from './WorkflowModalHeader';

type Props = {
  pageId: string,
  onCreated?: (workflowId: string) => void
  onClickWorkflowListPageBackButton: () => void;
}

export const WorkflowCreationModalContent = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { pageId, onCreated, onClickWorkflowListPageBackButton } = props;

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

  const [workflowName, setWorkflowName] = useState<string | undefined>();
  const [workflowDescription, setWorkflowDescription] = useState<string | undefined>();
  const [approverGroups, setApproverGroups] = useState<IWorkflowApproverGroupReq[] | undefined>(approverGroupsDummyData);

  const { trigger: createWorkflow } = useSWRMUTxCreateWorkflow(pageId, approverGroups, workflowName, workflowDescription);

  // const { createWorkflow } = useCreateWorkflow(pageId, workflowName, workflowDescription, approverGroups);

  const workflowNameChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(event.target.value);
  }, []);

  const workflowDescriptionChangeHandler = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWorkflowDescription(event.target.value);
  }, []);

  const createWorkflowButtonClickHandler = useCallback(async() => {
    if (approverGroups == null) {
      return;
    }

    try {
      // TODO: https://redmine.weseek.co.jp/issues/131035
      const createdWorkflow = await createWorkflow();
      if (onCreated != null && createdWorkflow != null) {
        onCreated(createdWorkflow._id);
      }
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [approverGroups, createWorkflow, onCreated]);

  return (
    <>
      <WorkflowModalHeader
        title={t('approval_workflow.create_new')}
        onClickPageBackButton={() => onClickWorkflowListPageBackButton()}
      />

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
      </ModalFooter>
    </>
  );
};
