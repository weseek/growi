import React from 'react';

import { type IUser, pagePathUtils } from '@growi/core';
import Link from 'next/link';

export const Username: React.FC<{ user?: IUser }> = ({ user }): JSX.Element => {

  if (user == null) {
    return <span>anyone</span>;
  }

  const name = user.name || '(no name)';
  const username = user.username;
  const href = pagePathUtils.userHomepagePath(user);

  return (
    <Link href={href} prefetch={false}>
      {name}(@{username})
    </Link>
  );
};
