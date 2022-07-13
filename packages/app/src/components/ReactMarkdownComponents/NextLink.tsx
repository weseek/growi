import Link from 'next/link';

import { useSiteUrl } from '~/stores/context';

type Props = {
  children: React.ReactNode,
  href?: string,
}

const isAnchorLink = (href: string): boolean => {
  return href.length > 0 && href[0] === '#';
};

const isExternalLink = (href: string, siteUrl: string | undefined): boolean => {
  const baseUrl = new URL(siteUrl ?? 'https://example.com');
  const hrefUrl = new URL(href, baseUrl);

  return baseUrl.host !== hrefUrl.host;
};

export const NextLink = ({ href, children }: Props): JSX.Element => {

  const { data: siteUrl } = useSiteUrl();

  // when href is an anchor link
  if (href == null || isAnchorLink(href)) {
    return <a href={href}>{children}</a>;
  }

  if (isExternalLink(href, siteUrl)) {
    return <a href={href} target="_blank" rel="noreferrer">
      {children}&nbsp;<i className='icon-share-alt small'></i>
    </a>;
  }

  return (
    <Link href={href}><a>{children}</a></Link>
  );
};
