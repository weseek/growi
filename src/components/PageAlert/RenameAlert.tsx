import { useRouter } from 'next/router';
import { VFC } from 'react';
import { apiPost } from '~/client/js/util/apiv1-client';
import { useTranslation } from '~/i18n';
import { useCurrentPagePath } from '~/stores/context';
import { useCurrentPageDeleted } from '~/stores/page';

export const RenameAlert:VFC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { renamedFrom, redirectFrom, withRedirect } = router.query;
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isDeleted } = useCurrentPageDeleted();

  if (renamedFrom == null && redirectFrom == null) {
    return null;
  }

  const handleUnlinkPageButton = async() => {
    const res = await apiPost('/pages.unlink', { path: currentPagePath });
    router.push(encodeURI(`${res.path}?unlinked=true`));
  };

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
      {withRedirect != null && !isDeleted && (
        <button type="button" id="unlink-page-button" className="btn btn-outline-dark btn-sm" onClick={handleUnlinkPageButton}>
          <i className="ti-unlink" aria-hidden="true" />
          Unlink redirection
        </button>
      )}
    </div>
  );
};
