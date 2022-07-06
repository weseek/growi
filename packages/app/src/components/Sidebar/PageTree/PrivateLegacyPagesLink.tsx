import React, { FC, memo } from 'react';

import { useTranslation } from 'next-i18next';

export const PrivateLegacyPagesLink: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <a href="/_private-legacy-pages" className="h5 grw-private-legacy-pages-anchor text-decoration-none">
      <i className="icon-drawer mr-2"></i> {t('pagetree.private_legacy_pages')}
    </a>
  );
});

PrivateLegacyPagesLink.displayName = 'PrivateLegacyPagesLink';
