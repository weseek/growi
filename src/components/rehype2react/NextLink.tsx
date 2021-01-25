import Link from 'next/link';

type Props = any & {
  children: JSX.Element[],
  href: string,
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const NextLink = (props: Props) => {
  return (
    <Link href={props.href}>
      <a href={props.href}>{props.children}</a>
    </Link>
  );
};

export default NextLink;
