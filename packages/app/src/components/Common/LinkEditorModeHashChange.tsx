import { FC, useEffect } from 'react';

import Link, { LinkProps } from 'next/link';

import { isEditorModeHash } from '~/stores/ui';

export const LinkEditorModeHashChange: FC<LinkProps> = (props: LinkProps) => {

  const url = new URL(props.href.toString(), 'http://example.com');
  const hash = url.hash;

  useEffect(() => {
    if (isEditorModeHash(hash) && window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }, [hash]);

  return <Link {...props} />;
};
