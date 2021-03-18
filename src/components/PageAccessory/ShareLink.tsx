import { VFC, useState } from 'react';

import { apiv3Get, apiv3Delete } from '../../client/js/util/apiv3-client';

import ShareLinkList from '../../client/js/components/ShareLink/ShareLinkList';
import { ShareLinkForm } from '~/components/PageAccessory/ShareLinkForm';

import { toastSuccess, toastError } from '../../client/js/util/apiNotification';
import { useTranslation } from '~/i18n';
import { useCurrentPageShareLinks } from '~/stores/page';

export const ShareLink:VFC = () => {
  const { t } = useTranslation();

  const { data: shareLinks } = useCurrentPageShareLinks();
  console.log(shareLinks);

  const [isOpenShareLinkForm, setIsOpenShareLinkForm] = useState(false);


  return (
    <div className="container p-0">
      <h3 className="grw-modal-head d-flex pb-2">
        { t('share_links.share_link_list') }
        {/* <button className="btn btn-danger ml-auto " type="button" onClick={this.deleteAllLinksButtonHandler}>{t('delete_all')}</button> */}
      </h3>

      <div>
        {/* <ShareLinkList
          shareLinks={this.state.shareLinks}
          onClickDeleteButton={this.deleteLinkById}
        /> */}
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

//   componentDidMount() {
//     this.retrieveShareLinks();
//   }

//   async retrieveShareLinks() {
//     const { pageContainer } = this.props;
//     const { pageId } = pageContainer.state;

//     try {
//       const res = await apiv3Get('/share-links/', { relatedPage: pageId });
//       const { shareLinksResult } = res.data;
//       this.setState({ shareLinks: shareLinksResult });
//     }
//     catch (err) {
//       toastError(err);
//     }

//   }

//   toggleShareLinkFormHandler() {
//     this.setState({ isOpenShareLinkForm: !this.state.isOpenShareLinkForm });
//     this.retrieveShareLinks();
//   }

//   async deleteAllLinksButtonHandler() {
//     const { t, pageContainer } = this.props;
//     const { pageId } = pageContainer.state;

//     try {
//       const res = await apiv3Delete('/share-links/', { relatedPage: pageId });
//       const count = res.data.n;
//       toastSuccess(t('toaster.remove_share_link', { count }));
//     }
//     catch (err) {
//       toastError(err);
//     }

//     this.retrieveShareLinks();
//   }

//   async deleteLinkById(shareLinkId) {
//     const { t } = this.props;

//     try {
//       const res = await apiv3Delete(`/share-links/${shareLinkId}`);
//       const { deletedShareLink } = res.data;
//       toastSuccess(t('toaster.remove_share_link_success', { shareLinkId: deletedShareLink._id }));
//     }
//     catch (err) {
//       toastError(err);
//     }

//     this.retrieveShareLinks();
//   }
