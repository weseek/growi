import React, { FC } from 'react';

import { useTranslation } from 'next-i18next';

export const NotCreatablePage: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="row not-found-message-row">
      <div className="col-md-12">
        <h2 className="text-muted">
          <i className="icon-ban mr-1" aria-hidden="true"></i>
          { t('not_creatable_page.could_not_creata_path') }
        </h2>
      </div>
    </div>
  );
};
