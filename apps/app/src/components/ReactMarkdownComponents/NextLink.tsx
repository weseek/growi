import { pagePathUtils } from '@growi/core';
import Link, { LinkProps } from 'next/link';

import { useSiteUrl } from '~/stores/context';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:components:NextLink');

const isAnchorLink = (href: string): boolean => {
  return href.toString().length > 0 && href[0] === '#';
};

const isExternalLink = (href: string, siteUrl: string | undefined): boolean => {
  try {
    const baseUrl = new URL(siteUrl ?? 'https://example.com');
    const hrefUrl = new URL(href, baseUrl);
    return baseUrl.host !== hrefUrl.host;
  }
  catch (err) {
    logger.debug(err);
    return false;
  }
};

const isCreatablePage = (href: string) => {
  const url = new URL(href);
  const pathName = url.pathname;

  return pagePathUtils.isCreatablePage(pathName);
};

type Props = Omit<LinkProps, 'href'> & {
  children: React.ReactNode,
  id?: string,
  href?: string,
  className?: string,
};

export const NextLink = (props: Props): JSX.Element => {
  const {
    id, href, children, className, ...rest
  } = props;

  const { data: siteUrl } = useSiteUrl();

  if (href == null) {
    return <a className={className}>{children}</a>;
  }

  // extract 'data-*' props
  const dataAttributes = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith('data-')),
  );

  // when href is an anchor link
  if (isAnchorLink(href)) {
    return (
      <a id={id} href={href} className={className} {...dataAttributes}>{children}</a>
    );
  }

  if (isExternalLink(href, siteUrl)) {
    return (
      <a id={id} href={href} className={className} target="_blank" rel="noopener noreferrer" {...dataAttributes}>
        {children}&nbsp;<i className='icon-share-alt small'></i>
      </a>
    );
  }

  if (!isCreatablePage(href)) {
    return (
      <a href={href} className={className}>{children}</a>
    );
  }

  return (
    <Link {...rest} href={href} prefetch={false} legacyBehavior>
      <a href={href} className={className} {...dataAttributes}>{children}</a>
    </Link>
  );
};
