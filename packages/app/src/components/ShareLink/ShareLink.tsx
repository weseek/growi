import React, {
  useState, useCallback,
} from 'react';

import { useTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Delete } from '~/client/util/apiv3-client';
import { useCurrentPageId } from '~/stores/context';
import { useSWRxSharelink } from '~/stores/share-link';

import { ShareLinkForm } from './ShareLinkForm';
import ShareLinkList from './ShareLinkList';

const ShareLink = (): JSX.Element => {
  const { t } = useTranslation();
  const [isOpenShareLinkForm, setIsOpenShareLinkForm] = useState<boolean>(false);

  const { data: currentPageId } = useCurrentPageId();

  const { data: currentShareLinks, mutate } = useSWRxSharelink(currentPageId);

  const toggleShareLinkFormHandler = useCallback(() => {
    setIsOpenShareLinkForm(prev => !prev);
    mutate();
  }, [mutate]);

  const deleteAllLinksButtonHandler = useCallback(async() => {
    try {
      const res = await apiv3Delete('/share-links/', { relatedPage: currentPageId });
      const count = res.data.n;
      toastSuccess(t('toaster.remove_share_link', { count }));
      mutate();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutate, currentPageId, t]);

  const deleteLinkById = useCallback(async(shareLinkId) => {
    try {
      const res = await apiv3Delete(`/share-links/${shareLinkId}`);
      const { deletedShareLink } = res.data;
      toastSuccess(t('toaster.remove_share_link_success', { shareLinkId: deletedShareLink._id }));
      mutate();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutate, t]);

  return (
    <div className="container p-0" data-testid="share-link-management">
      <h3 className="grw-modal-head d-flex pb-2">
        { t('share_links.share_link_list') }
        <button className="btn btn-danger ml-auto " type="button" onClick={deleteAllLinksButtonHandler}>{t('delete_all')}</button>
      </h3>
      <div>
        <ShareLinkList
          shareLinks={currentShareLinks == null ? [] : currentShareLinks}
          onClickDeleteButton={deleteLinkById}
        />
        <button
          className="btn btn-outline-secondary d-block mx-auto px-5"
          type="button"
          onClick={toggleShareLinkFormHandler}
        >
          {isOpenShareLinkForm ? t('Close') : t('New')}
        </button>
        {isOpenShareLinkForm && <ShareLinkForm onCloseForm={toggleShareLinkFormHandler} />}
      </div>
    </div>
  );
};

export default ShareLink;
