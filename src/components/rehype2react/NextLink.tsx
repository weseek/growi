import Link from 'next/link';

type Props = any & {
  children: JSX.Element[],
  href: string,
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const NextLink = ({ href, children }: Props) => {
  const anchor = <a href={href}>{children}</a>;

  // when href is an anchor link
  if (href.length > 0 && href[0] === '#') {
    return anchor;
  }

  return (
    <Link href={href}>{anchor}</Link>
  );
};

export default NextLink;
