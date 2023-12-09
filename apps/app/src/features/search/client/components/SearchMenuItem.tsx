import React from 'react';

import { useRouter } from 'next/router';
import { ListGroupItem } from 'reactstrap';

type Props = {
  children: React.ReactNode
  href: string
}

export const SearchMenuItem = (props: Props): JSX.Element => {
  const { children, href } = props;
  const router = useRouter();

  return (
    <ListGroupItem className="border-0 text-muted p-1 d-flex" tag="a" href={href} onClick={() => { router.push(href) }}>
      { children }
    </ListGroupItem>
  );
};
