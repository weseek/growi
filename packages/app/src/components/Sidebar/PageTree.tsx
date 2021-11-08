import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';


type Props = {
}

const PageTree:FC<Props> = (props: Props) => {

  const { t } = useTranslation();

  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">{t('Page Tree')}</h3>
      </div>
      <div className="grw-sidebar-content-body p-3">
        TBD
      </div>
    </>
  );
};

export default PageTree;
