// TODO: https://redmine.weseek.co.jp/issues/130338
import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';

import { useCurrentUser } from '~/stores/context';

import { IWorkflowApproverGroupReq, WorkflowApprovalType } from '../../../interfaces/workflow';
import { useSWRMUTxCreateWorkflow } from '../../stores/workflow';

import { ApproverGroupCard } from './ApproverGroupCard';
import { WorkflowModalHeader } from './WorkflowModalHeader';

type EditableApproverGroupCardProps = {
  creatorId?: string
  groupIndex: number
  editingApproverGroups: IWorkflowApproverGroupReq[]
  onUpdateApproverGroups: (groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReq) => void
  onClickAddApproverGroupCard: () => void
}

const EditableApproverGroupCard = (props: EditableApproverGroupCardProps): JSX.Element => {
  const {
    creatorId, groupIndex, editingApproverGroups, onClickAddApproverGroupCard, onUpdateApproverGroups,
  } = props;

  return (
    <div className="mt-4">
      <ApproverGroupCard
        creatorId={creatorId}
        groupIndex={groupIndex}
        editingApproverGroups={editingApproverGroups}
        onUpdateApproverGroups={onUpdateApproverGroups}
      />

      <div className="text-center mt-2">
        <button type="button" onClick={() => onClickAddApproverGroupCard()}>フローを追加</button>
      </div>
    </div>
  );
};


type WorkflowCreationModalContentProps = {
  pageId: string,
  onCreated?: () => void
  onClickWorkflowListPageBackButton: () => void;
}

export const WorkflowCreationModalContent = (props: WorkflowCreationModalContentProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const { pageId, onCreated, onClickWorkflowListPageBackButton } = props;

  const initialApproverGroup = {
    approvalType: WorkflowApprovalType.AND,
    approvers: [],
  };

  const [editingWorkflowName, setEditingWorkflowName] = useState<string | undefined>();
  const [editingWorkflowDescription, setEditingWorkflowDescription] = useState<string | undefined>();
  const [editingApproverGroups, setEditingApproverGroups] = useState<IWorkflowApproverGroupReq[]>([initialApproverGroup]);

  const { trigger: createWorkflow } = useSWRMUTxCreateWorkflow(pageId, editingApproverGroups, editingWorkflowName, editingWorkflowDescription);

  const workflowNameChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingWorkflowName(event.target.value);
  }, []);

  const workflowDescriptionChangeHandler = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingWorkflowDescription(event.target.value);
  }, []);

  const approverGroupsChangeHandler = useCallback((groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReq) => {
    const clonedApproverGroups = [...editingApproverGroups];
    clonedApproverGroups[groupIndex] = updateApproverGroupData;
    setEditingApproverGroups(clonedApproverGroups);
  }, [editingApproverGroups]);

  const addApproverGroupCardButtonClickHandler = () => {
    setEditingApproverGroups([...editingApproverGroups, [] as any]);
  };

  const createWorkflowButtonClickHandler = useCallback(async() => {
    if (editingApproverGroups == null) {
      return;
    }

    try {
      // TODO: https://redmine.weseek.co.jp/issues/131035
      await createWorkflow();
      if (onCreated != null) {
        onCreated();
      }
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [createWorkflow, editingApproverGroups, onCreated]);

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
                  value={editingWorkflowName}
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
                  value={editingWorkflowDescription}
                  onChange={workflowDescriptionChangeHandler}
                />
              </div>
            </div>
          </div>
        </div>

        {editingApproverGroups?.map((_, index) => (
          <EditableApproverGroupCard
            creatorId={currentUser?._id}
            groupIndex={index}
            editingApproverGroups={editingApproverGroups}
            onUpdateApproverGroups={approverGroupsChangeHandler}
            onClickAddApproverGroupCard={addApproverGroupCardButtonClickHandler}
          />
        ))}

      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={createWorkflowButtonClickHandler}>
          {t('approval_workflow.create')}
        </button>
      </ModalFooter>
    </>
  );
};
