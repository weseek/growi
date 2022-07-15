import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

const Bookmarks: FC = () => {
  const { t } = useTranslation('');

  // TODO Add bookmarks item

  return (
    <div className="grw-sidebar-content-header p-3">
      <h3 className="mb-0">{t('Bookmarks')}</h3>
    </div>
  );

};

export default Bookmarks;
