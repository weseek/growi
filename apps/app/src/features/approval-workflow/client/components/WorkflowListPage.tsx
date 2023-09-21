// TODO: https://redmine.weseek.co.jp/issues/130336
import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import {
  ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap';

import { IWorkflowHasId } from '../../interfaces/workflow';


type Props = {
  workflows: IWorkflowHasId[]
  onClickCreateWorkflowButton: () => void;
}


export const WorkflowListPage = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflows, onClickCreateWorkflowButton } = props;

  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const createWorkflowButtonClickHandler = useCallback(() => {
    if (onClickCreateWorkflowButton == null) {
      return;
    }

    onClickCreateWorkflowButton();
  }, [onClickCreateWorkflowButton]);

  const deleteWorkflowButtonClickHandler = useCallback((workflowId: string) => {
    console.log('clicked', workflowId);
  }, []);

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
                    <td>
                      <Dropdown isOpen={isOpenMenu} toggle={() => { setIsOpenMenu(!isOpenMenu) }}>
                        <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control d-flex align-items-center justify-content-center">
                          <i className="icon-options"></i>
                        </DropdownToggle>

                        <DropdownMenu>
                          <DropdownItem
                            className="text-danger"
                            onClick={() => { deleteWorkflowButtonClickHandler(workflow._id) }}
                          >{t('approval_workflow.delete')}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
