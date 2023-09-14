import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { IWorkflowApproverGroup, WorkflowApprovalType, WorkflowApproverStatus } from '~/interfaces/workflow';

type Props = {
  pageId: string,
  onClickWorkflowListPageBackButton: () => void;
}

export const CreateWorkflowPage = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { onClickWorkflowListPageBackButton, pageId } = props;

  const approverGroupsDummyData = [{
    approvalType: WorkflowApprovalType.AND,
    approvers: [
      {
        user: '64e4072930f26dcc81590064',
        status: WorkflowApproverStatus.NONE,
      },
      {
        user: '64e4072930f86dcc81590068',
        status: WorkflowApproverStatus.NONE,
      },
    ],
  }] as unknown as IWorkflowApproverGroup[];

  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowDescription, setWorkflowDescription] = useState<string>('');
  const [approverGroups, setApproverGroups] = useState<IWorkflowApproverGroup[] | undefined>(approverGroupsDummyData);

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
    try {
      await apiv3Post('/workflow', {
        pageId, name: workflowName, comment: workflowDescription, approverGroups,
      });
      // TODO: Move to the detail screen
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [pageId, approverGroups, workflowDescription, workflowName]);

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
