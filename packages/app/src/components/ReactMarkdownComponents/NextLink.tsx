import Link, { LinkProps } from 'next/link';

import { useSiteUrl } from '~/stores/context';

const isAnchorLink = (href: string): boolean => {
  return href.toString().length > 0 && href[0] === '#';
};

const isExternalLink = (href: string, siteUrl: string | undefined): boolean => {
  const baseUrl = new URL(siteUrl ?? 'https://example.com');
  const hrefUrl = new URL(href, baseUrl);

  return baseUrl.host !== hrefUrl.host;
};

type Props = Omit<LinkProps, 'href'> & {
  children: React.ReactNode,
  href?: string,
  className?: string,
};

export const NextLink = ({
  href, children, className, ...props
}: Props): JSX.Element => {

  const { data: siteUrl } = useSiteUrl();

  // when href is an anchor link
  if (href == null || isAnchorLink(href)) {
    return <a href={href} className={className}>{children}</a>;
  }

  if (isExternalLink(href, siteUrl)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}&nbsp;<i className='icon-share-alt small'></i>
      </a>
    );
  }

  return (
    <Link {...props} href={href} prefetch={false}>
      <a href={href} className={className}>{children}</a>
    </Link>
  );
};
