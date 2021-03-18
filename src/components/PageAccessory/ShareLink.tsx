import { VFC, useState } from 'react';

import { apiv3Delete } from '~/utils/apiv3-client';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { useTranslation } from '~/i18n';
import { useCurrentPageSWR, useCurrentPageShareLinks } from '~/stores/page';
import { useCurrentUser } from '~/stores/context';

import { ShareLinkList } from '~/components/PageAccessory/ShareLinkList';
import { ShareLinkForm } from '~/components/PageAccessory/ShareLinkForm';

export const ShareLink:VFC = () => {
  const { t } = useTranslation();

  const { data: shareLinks, mutate: mutateShareLinks } = useCurrentPageShareLinks();
  const { data: currentPage } = useCurrentPageSWR();
  const { data: currentUser } = useCurrentUser();

  const [isOpenShareLinkForm, setIsOpenShareLinkForm] = useState(false);

  if (currentPage == null) {
    return null;
  }

  const handleDeleteAllLinksButton = async() => {
    try {
      const res = await apiv3Delete('/share-links/', { relatedPage: currentPage._id });
      toastSuccess(t('toaster.remove_share_link', { count: res.data.n }));
    }
    catch (err) {
      toastError(err);
    }
    mutateShareLinks();
  };

  const deleteLinkById = async(shareLinkId:string) => {
    try {
      const res = await apiv3Delete(`/share-links/${shareLinkId}`);
      const { deletedShareLink } = res.data;
      toastSuccess(t('toaster.remove_share_link_success', { shareLinkId: deletedShareLink._id }));
    }
    catch (err) {
      toastError(err);
    }
    mutateShareLinks();
  };

  return (
    <div className="container p-0">
      <h3 className="grw-modal-head d-flex pb-2">
        { t('share_links.share_link_list') }
        <button className="btn btn-danger ml-auto " type="button" onClick={handleDeleteAllLinksButton}>{t('delete_all')}</button>
      </h3>

      <div>
        {shareLinks != null
        && (
          <ShareLinkList
            isAdmin={currentUser != null && currentUser.admin}
            shareLinks={shareLinks}
            onClickDeleteButton={deleteLinkById}
          />
        )}
        <button
          className="btn btn-outline-secondary d-block mx-auto px-5"
          type="button"
          onClick={() => setIsOpenShareLinkForm(!isOpenShareLinkForm)}
        >
          {isOpenShareLinkForm ? t('Close') : t('New')}
        </button>
        {isOpenShareLinkForm && <ShareLinkForm onCloseForm={() => setIsOpenShareLinkForm(false)} />}
      </div>
    </div>
  );
};
