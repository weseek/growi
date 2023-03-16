import React from 'react';

import type { IUser } from '@growi/core';
import Link from 'next/link';

export const Username: React.FC<{ user?: IUser }> = ({ user }): JSX.Element => {

  if (user == null) {
    return <span>anyone</span>;
  }

  const name = user.name || '(no name)';
  const username = user.username;
  const href = `/user/${user.username}`;

  return (
    <Link href={href} prefetch={false}>
      {name}(@{username})
    </Link>
  );
};
