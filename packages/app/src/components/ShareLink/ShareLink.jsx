import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import useSWR from 'swr';

import PageContainer from '~/client/services/PageContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Delete, apiv3Get } from '~/client/util/apiv3-client';

import { withUnstatedContainers } from '../UnstatedUtils';

import ShareLinkForm from './ShareLinkForm';
import ShareLinkList from './ShareLinkList';

const ShareLink = (props) => {
  const { t } = useTranslation();
  const { pageId } = props.pageContainer.state;
  const [isOpenShareLinkForm, setIsOpenShareLinkForm] = useState(false);

  const fetchShareLinks = useCallback(async(endpoint, pageId) => {
    const res = await apiv3Get(endpoint, { relatedPage: pageId });
    return {
      shareLinkList: res.data.shareLinksResult,
    };
  }, []);

  const { data, isValidating, mutate } = useSWR('/share-links/', (endpoint => fetchShareLinks(endpoint, pageId)));

  const toggleShareLinkFormHandler = useCallback(() => {
    setIsOpenShareLinkForm(prev => !prev);
    mutate();
  }, [mutate]);

  const deleteAllLinksButtonHandler = useCallback(async(pageId) => {
    try {
      const res = await apiv3Delete('/share-links/', { relatedPage: pageId });
      const count = res.data.n;
      toastSuccess(t('toaster.remove_share_link', { count }));
      mutate();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutate, t]);

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
        <button className="btn btn-danger ml-auto " type="button" onClick={() => deleteAllLinksButtonHandler(pageId)}>{t('delete_all')}</button>
      </h3>

      <div>
        <ShareLinkList
          shareLinks={!isValidating ? data.shareLinkList : []}
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

ShareLink.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

const ShareLinkWrapper = withUnstatedContainers(ShareLink, [PageContainer]);

export default ShareLinkWrapper;
