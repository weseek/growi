import React, { useMemo } from 'react';

import { useTranslation } from 'next-i18next';

import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import { DescendantsPageListForCurrentPath } from './DescendantsPageList';
import PageListIcon from './Icons/PageListIcon';


type Props = {
  isLinkSharingDisabled?: boolean,
}

const ForbiddenPage = React.memo((props: Props): JSX.Element => {
  const { t } = useTranslation();

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: DescendantsPageListForCurrentPath,
        i18n: t('page_list'),
        index: 0,
      },
    };
  }, [t]);

  return (
    <>
      <div className="row not-found-message-row mb-4">
        <div className="col-lg-12">
          <h2 className="text-muted">
            <i className="icon-ban mr-2" aria-hidden="true" />
            Forbidden
          </h2>
        </div>
      </div>

      <div className="row row-alerts d-edit-none">
        <div className="col-sm-12">
          <p className="alert alert-primary py-3 px-4">
            <i className="icon-fw icon-lock" aria-hidden="true" />
            { props.isLinkSharingDisabled ? t('custom_navigation.link_sharing_is_disabled') : t('Browsing of this page is restricted')}
          </p>
        </div>
      </div>

      { !props.isLinkSharingDisabled && (
        <div className="mt-5">
          <CustomNavAndContents navTabMapping={navTabMapping} />
        </div>
      ) }

    </>
  );
});

ForbiddenPage.displayName = 'ForbiddenPage';

export default ForbiddenPage;
