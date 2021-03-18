import Link from 'next/link';
import { VFC } from 'react';
import { User } from '~/interfaces/user';


type Props = {
  user?:User
};

export const Username:VFC<Props> = (props: Props) => {
  const { user } = props;

  if (user == null) {
    return <span>anyone</span>;
  }

  const name = user.name || '(no name)';
  const username = user.username;
  const href = `/user/${user.username}`;

  return (
    <Link href={href}>
      <a>
        {name} (@{username})
      </a>
    </Link>
  );
};
