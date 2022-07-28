import React, { useState, useCallback, useEffect } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';


import PageContainer from '~/client/services/PageContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Delete, apiv3Get } from '~/client/util/apiv3-client';

import { withUnstatedContainers } from '../UnstatedUtils';

import ShareLinkForm from './ShareLinkForm';
import ShareLinkList from './ShareLinkList';

const ShareLink = (props) => {
  const { t } = useTranslation();
  const { pageContainer } = props;
  const { pageId } = pageContainer.state;
  const [shareLinks, setShareLinks] = useState([]);
  const [isOpenShareLinkForm, setIsOpenShareLinkForm] = useState(false);

  const retrieveShareLinks = useCallback(async() => {
    try {
      const res = await apiv3Get('/share-links/', { relatedPage: pageId });
      const { shareLinksResult } = res.data;
      setShareLinks(shareLinksResult);
    }
    catch (err) {
      toastError(err);
    }

  }, [pageId]);

  const toggleShareLinkFormHandler = useCallback(() => {
    setIsOpenShareLinkForm(prev => !prev);
    retrieveShareLinks();
  }, [retrieveShareLinks]);

  const deleteAllLinksButtonHandler = useCallback(async() => {

    try {
      const res = await apiv3Delete('/share-links/', { relatedPage: pageId });
      const count = res.data.n;
      toastSuccess(t('toaster.remove_share_link', { count }));
    }
    catch (err) {
      toastError(err);
    }

    retrieveShareLinks();
  }, [retrieveShareLinks, pageId, t]);

  const deleteLinkById = useCallback(async(shareLinkId) => {

    try {
      const res = await apiv3Delete(`/share-links/${shareLinkId}`);
      const { deletedShareLink } = res.data;
      toastSuccess(t('toaster.remove_share_link_success', { shareLinkId: deletedShareLink._id }));
    }
    catch (err) {
      toastError(err);
    }

    retrieveShareLinks();
  }, [t, retrieveShareLinks]);

  useEffect(() => {
    retrieveShareLinks();
  }, [retrieveShareLinks]);

  return (
    <div className="container p-0" data-testid="share-link-management">
      <h3 className="grw-modal-head d-flex pb-2">
        { t('share_links.share_link_list') }
        <button className="btn btn-danger ml-auto " type="button" onClick={deleteAllLinksButtonHandler}>{t('delete_all')}</button>
      </h3>

      <div>
        <ShareLinkList
          shareLinks={shareLinks}
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

const ShareLinkWrapperFC = (props) => {
  return <ShareLink {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const ShareLinkWrapper = withUnstatedContainers(ShareLinkWrapperFC, [PageContainer]);

export default ShareLinkWrapper;
