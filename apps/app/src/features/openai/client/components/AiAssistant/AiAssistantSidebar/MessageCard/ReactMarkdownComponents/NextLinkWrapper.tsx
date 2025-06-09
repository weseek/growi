
import type { LinkProps } from 'next/link';

import { NextLink } from '~/components/ReactMarkdownComponents/NextLink';

export const NextLinkWrapper = (props: LinkProps & {children: string, href: string}): JSX.Element => {
  return (
    <NextLink href={props.href} className="link-primary">
      {props.children}
    </NextLink>
  );
};
