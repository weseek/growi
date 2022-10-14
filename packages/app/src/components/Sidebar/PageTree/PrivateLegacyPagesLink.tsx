import React, { FC, memo } from 'react';

import Link from 'next/link';

import { useTranslation } from 'next-i18next';

export const PrivateLegacyPagesLink: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <Link href="/_private-legacy-pages" prefetch={false}>
      <a className="h5 grw-private-legacy-pages-anchor text-decoration-none">
        <i className="icon-drawer mr-2"></i> {t('pagetree.private_legacy_pages')}
      </a>
    </Link>
  );
});

PrivateLegacyPagesLink.displayName = 'PrivateLegacyPagesLink';
