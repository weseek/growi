import { useRouter } from 'next/router';
import { VFC } from 'react';
import { useTranslation } from '~/i18n';

type Props = {

}

export const RenameAlert:VFC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { renamedFrom, redirectFrom, withRedirect } = router.query;

  if (renamedFrom == null && redirectFrom == null) {
    return null;
  }

  return (
    <div className="alert alert-pink d-edit-none py-3 px-4 d-flex align-items-center justify-content-between">
      {renamedFrom != null && (
        <span>
          <strong>{ t('Moved') }:</strong> {t('page_page.notice.moved')} <code>{renamedFrom}</code> {t('page_page.notice.moved_period')}
        </span>
      )}
      {redirectFrom != null && (
        <span>
          <strong>{ t('Redirected') }:</strong> { t('page_page.notice.redirected')} <code>{redirectFrom}</code> {t('page_page.notice.redirected_period')}
        </span>
      )}
    </div>
  );
};
