import Link, { LinkProps } from 'next/link';

// import { useEditorMode, determineEditorModeByHash } from '~/stores/ui';

export const Growilink = (props: LinkProps): JSX.Element => {
  // const { mutate } = useEditorMode();

  // // TODO: see href and change editor mode
  // const url = new URL(props.href.toString(), 'http://example.com');
  // const hash = url.hash;
  // if (hash === '#view') {

  // }

  return <Link {...props} />;
};
