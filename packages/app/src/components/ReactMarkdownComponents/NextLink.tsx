import Link, { LinkProps } from 'next/link';
import { Link as ScrollLink } from 'react-scroll';

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

type Props = Omit<LinkProps, 'href'> & {
  children: React.ReactNode,
  href?: string,
  className?: string,
};

export const NextLink = ({
  href, children, className, ...props
}: Props): JSX.Element => {

  const { data: siteUrl } = useSiteUrl();

  if (href == null) {
    return <a className={className}>{children}</a>;
  }

  // when href is an anchor link
  if (isAnchorLink(href)) {
    return (
      <Link href={href} shallow >
        <a href={href} className={className}>{children}</a>
      </Link>
    );
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
