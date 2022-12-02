import { useTranslation } from 'next-i18next';

import { useSiteUrl } from '~/stores/context';

const isValidUrl = (str: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(str);
    return true;
  }
  catch {
    return false;
  }
};

export const AlertSiteUrlUndefined = (): JSX.Element => {
  const { t } = useTranslation('commons');
  const { data: siteUrl, error: errorSiteUrl } = useSiteUrl();
  const isLoadingSiteUrl = siteUrl === undefined && errorSiteUrl === undefined;

  if (isLoadingSiteUrl) {
    return <></>;
  }

  if (typeof siteUrl === 'string' && isValidUrl(siteUrl)) {
    return <></>;
  }

  return (
    <div className="alert alert-danger rounded-0 d-edit-none mb-0 px-4 py-2">
      <i className="icon-exclamation"></i>
      {
        t('alert.siteUrl_is_not_set', { link: t('headers.app_settings') })
      } &gt;&gt; <a href="/admin/app">{t('headers.app_settings')}<i className="icon-login"></i></a>
    </div>
  );
};
AlertSiteUrlUndefined.displayName = 'AlertSiteUrlUndefined';
