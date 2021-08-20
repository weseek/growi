import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  slackAppIntegration: {
    _id: string,
    isPrimary?: boolean,
  },
  onIsPrimaryChanged?: (slackAppIntegration: unknown, newValue: boolean) => void,
  onDeleteButtonClicked?: (slackAppIntegration: unknown) => void,
}

export const SlackAppIntegrationControl: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { slackAppIntegration, onIsPrimaryChanged, onDeleteButtonClicked } = props;

  return (
    <div className="d-flex align-items-center">
      <div className="my-1 custom-control custom-switch">
        <input
          className="custom-control-input"
          id="cb-primary"
          type="checkbox"
          defaultChecked={slackAppIntegration.isPrimary}
          onChange={(e) => {
            if (onIsPrimaryChanged != null) {
              onIsPrimaryChanged(slackAppIntegration, e.target.checked);
            }
          }}
        />
        <label className="custom-control-label" htmlFor="cb-primary">
          Primary
        </label>
      </div>
      <button
        className="btn btn-outline-danger ml-3"
        type="button"
        onClick={() => {
          if (onDeleteButtonClicked != null) {
            onDeleteButtonClicked(slackAppIntegration);
          }
        }}
      >
        <i className="icon-trash mr-1" />
        {t('admin:slack_integration.delete')}
      </button>
    </div>
  );
};
