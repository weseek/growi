// TODO: https://redmine.weseek.co.jp/issues/130336
import React, { useState, useCallback } from 'react';

import nodePath from 'path';

import { UserPicture } from '@growi/ui/dist/components';
import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';
import {
  ModalBody, ModalFooter, Dropdown, DropdownMenu, DropdownToggle, DropdownItem, UncontrolledTooltip,
} from 'reactstrap';

import { useCurrentUser } from '~/stores/context';
import { useCurrentPagePath } from '~/stores/page';

import { type IWorkflowHasId, WorkflowStatus } from '../../../interfaces/workflow';
import { isWorkflowNameSet } from '../../../utils/workflow';
import { deleteWorkflow } from '../../services/workflow';

import { WorkflowModalHeader } from './WorkflowModalHeader';


type Props = {
  workflows: IWorkflowHasId[]
  onDeleted?: () => void;
  onClickCreateWorkflowButton: () => void;
  onClickShowWorkflowDetailButton: (workflowId: string) => void;
}

const formatDate = (date: Date) => {
  return format(new Date(date), 'yyyy/MM/dd HH:mm');
};

const WorkflowStatusBadge = (props: { status: string }) => {
  const { status } = props;

  const { t } = useTranslation();

  let className: string;

  switch (status) {
    case WorkflowStatus.APPROVE:
      className = 'bg-success-subtle border border-success-subtle text-success-emphasis';
      break;
    case WorkflowStatus.INPROGRESS:
      className = 'bg-info-subtle border border-info-subtle text-info-emphasis';
      break;
    default:
      return <></>;
  }

  return (
    <h5>
      <span className={`badge ${className} rounded-pill`}>
        {t(`approval_workflow.workflow_status.${status}`)}
      </span>
    </h5>
  );

};

export const WorkflowListModalContent = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const {
    workflows, onDeleted, onClickCreateWorkflowButton, onClickShowWorkflowDetailButton,
  } = props;

  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();

  const pageTitle = nodePath.basename(currentPagePath ?? '') || '/';

  const createWorkflowButtonClickHandler = useCallback(() => {
    if (onClickCreateWorkflowButton == null) {
      return;
    }

    onClickCreateWorkflowButton();
  }, [onClickCreateWorkflowButton]);

  const deleteWorkflowButtonClickHandler = useCallback(async(workflowId: string) => {
    try {
      await deleteWorkflow(workflowId);
      if (onDeleted != null) {
        onDeleted();
      }
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [onDeleted]);

  const showWorkflowDetailButtonClickHandler = useCallback((workflowId: string) => {
    if (onClickShowWorkflowDetailButton == null) {
      return null;
    }

    onClickShowWorkflowDetailButton(workflowId);

  }, [onClickShowWorkflowDetailButton]);

  const isDeletable = useCallback((workflow: IWorkflowHasId): boolean => {
    if (currentUser == null) {
      return false;
    }

    if (currentUser.admin) {
      return true;
    }

    const creatorAndApprovers: string[] = [workflow.creator._id];
    workflow.approverGroups.forEach((approverGroup) => {
      approverGroup.approvers.forEach((approver) => {
        creatorAndApprovers.push(approver.user.toString());
      });
    });

    if (creatorAndApprovers.includes(currentUser._id)) {
      return true;
    }

    return false;

  }, [currentUser]);

  return (
    <>
      <WorkflowModalHeader>
        <span className="material-symbols-outlined me-3">account_tree</span>
        <span className="fw-bold">{t('approval_workflow.list')}</span>
      </WorkflowModalHeader>

      <ModalBody>
        {(workflows.length === 0) && (
          <>{t('approval_workflow.list_not_found')}</>
        )}

        {/* TODO: Allow infinite scrolling */}
        {(workflows.length >= 1 && (
          <table
            className="table h-100"
            style={{ borderSpacing: '0 10px', borderCollapse: 'separate' }}
          >
            <thead>
              <tr>
                <th scope="col">{t('approval_workflow.name')}</th>
                <th scope="col">{t('approval_workflow.status')}</th>
                <th scope="col">{t('approval_workflow.applicant')}</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((workflow) => {
                return (
                  <tr data-testid="activity-table" key={workflow._id}>
                    <td className="align-middle border-end border-secondary-subtle border-bottom-0">
                      <div className="h-75">
                        { isWorkflowNameSet(workflow.name) ? workflow.name : pageTitle }
                        <div className="d-flex align-items-center">
                          <span className="text-muted flex-grow-1">
                            {formatDate(workflow.createdAt)}
                          </span>
                          <span className="py-0 btn btn-link text-muted ms-auto" onClick={() => showWorkflowDetailButtonClickHandler(workflow._id)}>
                            {t('approval_workflow.show_detail')}
                            <i className="fa fa-fw fa-chevron-right" aria-hidden="true"></i>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center border-end border-secondary-subtle align-middle border-bottom-0">
                      <div className="h-75 d-flex align-items-center justify-content-center">
                        <WorkflowStatusBadge status={workflow.status} />
                      </div>
                    </td>
                    <td className="align-middle border-end border-secondary-subtle border-bottom-0">
                      <div className="h-75 d-flex align-items-center justify-content-center">
                        <div className="d-inline-block pe-2">
                          <UserPicture user={workflow.creator} noLink noTooltip />
                        </div>
                        {workflow.creator.username}
                      </div>
                    </td>
                    <td className="align-middle border-bottom-0">
                      <div className="h-75 d-flex align-items-center justify-content-center">
                        <Dropdown isOpen={isOpenMenu} toggle={() => { setIsOpenMenu(!isOpenMenu) }}>
                          <DropdownToggle
                            color="transparent"
                            className="border-0 rounded btn-page-item-control d-flex align-items-center justify-content-center"
                          >
                            <i className="icon-options"></i>
                          </DropdownToggle>

                          <DropdownMenu>
                            <div id="delete-workflow-button">
                              <DropdownItem
                                className={isDeletable(workflow) ? 'text-danger' : ''}
                                disabled={!isDeletable(workflow)}
                                onClick={() => { deleteWorkflowButtonClickHandler(workflow._id) }}
                              >{t('approval_workflow.delete')}
                              </DropdownItem>
                              {/* see: https://stackoverflow.com/questions/52180239/how-add-tooltip-for-disabed-button-reactstrap */}
                              { !isDeletable(workflow) && (
                                <UncontrolledTooltip
                                  target="delete-workflow-button"
                                  placement="bottom"
                                  fade={false}
                                >
                                  {t('approval_workflow.delete_button_tooltip')}
                                </UncontrolledTooltip>
                              )}
                            </div>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </ModalBody>

      <ModalFooter>
        <button className="btn btn-primary mx-auto" type="button" onClick={createWorkflowButtonClickHandler}>
          <div className="title">
            {t('approval_workflow.create')}
          </div>
        </button>
      </ModalFooter>
    </>
  );
};
