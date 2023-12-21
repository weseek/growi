import { FC } from 'react';

import { useTranslation } from 'next-i18next';

type Props = {
  editingWorkflowName: string | undefined
  workflowNameChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void
  editingWorkflowDescription: string | undefined
  workflowDescriptionChangeHandler: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
};

export const WorkflowForm: FC<Props> = (props) => {

  const {
    editingWorkflowName, workflowNameChangeHandler, editingWorkflowDescription, workflowDescriptionChangeHandler,
  } = props;

  const { t } = useTranslation();

  return (
    <div className="mb-3">
      <div className="row align-items-center">
        <label htmlFor="name" className="col-md-4 col-form-label text-center">
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
        <label htmlFor="description" className="col-md-4 col-form-label text-center">
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
    </div>
  );
};
