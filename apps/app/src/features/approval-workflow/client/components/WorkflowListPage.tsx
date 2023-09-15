// TODO: https://redmine.weseek.co.jp/issues/130336
import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { IWorkflowHasId } from '../../interfaces/workflow';


type Props = {
  workflows: IWorkflowHasId[]
  onClickCreateWorkflowButton: () => void;
}


export const WorkflowListPage = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflows, onClickCreateWorkflowButton } = props;

  const createWorkflowButtonClickHandler = useCallback(() => {
    if (onClickCreateWorkflowButton == null) {
      return;
    }

    onClickCreateWorkflowButton();
  }, [onClickCreateWorkflowButton]);

  return (
    <>
      <ModalHeader className="bg-primary">
        {t('approval_workflow.list')}
      </ModalHeader>

      <ModalBody>
        {(workflows.length === 0) && (
          <>{t('approval_workflow.list_not_found')}</>
        )}

        {/* TODO: Allow infinite scrolling */}
        {(workflows.length >= 1 && (
          <div className="table-responsive text-nowrap h-100">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">{t('approval_workflow.name')}</th>
                  <th scope="col">{t('approval_workflow.status')}</th>
                  <th scope="col">{t('approval_workflow.applicant')}</th>
                </tr>
              </thead>

              <tbody>
                {workflows.map((workflow) => {
                  return (
                    <tr data-testid="activity-table" key={workflow._id}>
                      <td>
                        {workflow.name}
                      </td>
                      <td>
                        {t(`approval_workflow.statuses.${workflow.status}`)}
                      </td>
                      <td>
                        {workflow.creator.username}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
