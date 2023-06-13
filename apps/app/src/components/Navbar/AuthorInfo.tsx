import React from 'react';

import { pagePathUtils } from '@growi/core';
import type { IUser } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import { format } from 'date-fns';
import Link from 'next/link';

export type AuthorInfoProps = {
  date: Date,
  user: IUser,
  mode: 'create' | 'update',
  locate: 'subnav' | 'footer',
}

export const AuthorInfo = (props: AuthorInfoProps): JSX.Element => {
  const {
    date, user, mode = 'create', locate = 'subnav',
  } = props;

  const { userHomepagePath } = pagePathUtils;
  const formatType = 'yyyy/MM/dd HH:mm';

  const infoLabelForSubNav = mode === 'create'
    ? 'Created by'
    : 'Updated by';
  const nullinfoLabelForFooter = mode === 'create'
    ? 'Created by'
    : 'Updated by';
  const infoLabelForFooter = mode === 'create'
    ? 'Created at'
    : 'Last revision posted at';
  const userLabel = user != null
    ? (
      <Link href={userHomepagePath(user.username)} prefetch={false}>
        {user.name}
      </Link>
    )
    : <i>Unknown</i>;

  if (locate === 'footer') {
    try {
      return <p>{infoLabelForFooter} {format(new Date(date), formatType)} by <UserPicture user={user} size="sm"/> {userLabel}</p>;
    }
    catch (err) {
      if (err instanceof RangeError) {
        return <p>{nullinfoLabelForFooter} <UserPicture user={user} size="sm"/> {userLabel}</p>;
      }
      return <></>;
    }
  }

  const renderParsedDate = () => {
    try {
      return format(new Date(date), formatType);
    }
    catch (err) {
      return '';
    }
  };

  return (
    <div className="d-flex align-items-center">
      <div className="mr-2">
        <UserPicture user={user} size="sm"/>
      </div>
      <div>
        <div>{infoLabelForSubNav} {userLabel}</div>
        <div className="text-muted text-date" data-vrt-blackout-datetime>
          {renderParsedDate()}
        </div>
      </div>
    </div>
  );
};
