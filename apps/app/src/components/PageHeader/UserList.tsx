import type { FC } from 'react';

import type { IUser } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';

type Props = {
  className: string,
  userList: IUser[]
}

export const UserList: FC<Props> = (props) => {
  const { className, userList } = props;
  return (
    <div className={className}>
      {userList.length > 0 && (
        <div className="d-flex justify-content-end">
          {userList.map((user) => {
            return (
              <div className="ms-1">
                <UserPicture
                  user={user}
                  noLink
                  additionalClassName="border border-info rounded-circle"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
