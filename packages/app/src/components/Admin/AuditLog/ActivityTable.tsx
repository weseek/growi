import React, { FC } from 'react';

import { format } from 'date-fns';

import { IActivityHasId } from '~/interfaces/activity';

type Props = {
  activityList: IActivityHasId[]
}

const formatDate = (date) => {
  return format(new Date(date), 'yyyy/MM/dd HH:mm:ss');
};

export const ActivityTable : FC<Props> = (props: Props) => {
  return (
    <div className="table-responsive text-nowrap h-100">
      <table className="table table-default table-bordered table-user-list">
        <thead>
          <tr>
            <th scope="col">username</th>
            <th scope="col">targetModel</th>
            <th scope="col">action</th>
            <th scope="col">createdAt</th>
          </tr>
        </thead>
        <tbody>
          {props.activityList.map((activity) => {
            return (
              <tr data-testid="user-table-tr" key={activity._id}>
                <td>{activity.user?.username}</td>
                <td>{activity.targetModel}</td>
                <td>{activity.action}</td>
                <td>{formatDate(activity.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
