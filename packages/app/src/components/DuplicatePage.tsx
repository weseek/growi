import React, { FC } from 'react';
import { DevidedPagePath } from '@growi/core';
import { useTranslation } from 'react-i18next';


type Props = {
  path : string,
}

const DuplicatePageAlert : FC<Props> = (props: Props) => {
  const { path } = props;
  const { t } = useTranslation();
  const devidedPath = new DevidedPagePath(path);

  return (
    <div className="alert alert-warning py-3">
      <h5 className="font-weight-bold mt-1">{t('duplicated_page_alert.same_page_name_exists', { pageName: devidedPath.latter })}</h5>
      <p>
        {t('duplicated_page_alert.same_page_name_exists_at_path',
          { path: devidedPath.isFormerRoot ? '/' : devidedPath.former, pageName: devidedPath.latter })}<br />
        <p dangerouslySetInnerHTML={{ __html: t('See_more_detail_on_new_schema', { url: t('GROWI.4.9_new_schema') }) }} />
      </p>
      <p className="mb-1">{t('duplicated_page_alert.select_page_to_see')}</p>
    </div>
  );
};
