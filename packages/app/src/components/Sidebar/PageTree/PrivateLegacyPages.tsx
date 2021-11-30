import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

const PrivateLegacyPages: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="grw-prvt-legacy-pages p-3">
      <a href="/private-legacy-pages?q=[nq:PrivateLegacyPages]" className="h5">
        <i className="icon-drawer mr-2"></i> PrivateLegacyPages
      </a>
    </div>
  );
});

export default PrivateLegacyPages;
