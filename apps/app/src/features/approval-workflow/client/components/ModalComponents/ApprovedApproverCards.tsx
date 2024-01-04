import { FC } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'react-i18next';

type ApprovedApproverCardsProps = {
  ApprovedApprovers?: IUserHasId[]
}

type ApprovedApproverCardProps = {
  username: string
}

const ApprovedApproverCard: FC<ApprovedApproverCardProps> = (props) => {
  const { username } = props;

  const { t } = useTranslation();

  return (
    <div>
      <span className="input-group-text">
        <i className="icon-people" />
      </span>
      <div>{username}</div>
      <div>{t('approval_workflow.approvar_status_approve')}</div>
    </div>
  );
};

export const ApprovedApproverCards: FC<ApprovedApproverCardsProps> = (props): JSX.Element => {
  const { ApprovedApprovers } = props;

  return (
    <>
      {ApprovedApprovers?.map(data => (
        <ApprovedApproverCard
          username={data.username}
        />
      ))}
    </>
  );
};
