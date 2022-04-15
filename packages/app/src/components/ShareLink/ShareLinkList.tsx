import React from 'react';

import dateFnsFormat from 'date-fns/format';
import PropTypes from 'prop-types';
import { useTranslation, withTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';

import CopyDropdown from '../Page/CopyDropdown';
import { withUnstatedContainers } from '../UnstatedUtils';


const ShareLinkTr = (props) => {
  const { t } = useTranslation();

  const { isAdmin, shareLink, onDelete } = props;

  const { _id: shareLinkId, relatedPage } = shareLink;

  const isRelatedPageExists = relatedPage != null;

  return (
    <tr key={shareLinkId}>
      <td>
        <div className="d-flex">
          <span className="mr-auto my-auto">{shareLinkId}</span>

          { isRelatedPageExists && (
            <CopyDropdown
              pagePath={relatedPage.path}
              dropdownToggleId={`copydropdown-${shareLinkId}`}
              pageId={shareLinkId}
              isShareLinkMode
            >
              Copy Link
            </CopyDropdown>
          ) }
        </div>
      </td>
      { isAdmin && (
        <td>
          { isRelatedPageExists
            ? <a href={relatedPage.path}>{relatedPage.path}</a>
            : '(Page is not found)'
          }
        </td>
      ) }
      <td>{shareLink.expiredAt && <span>{dateFnsFormat(new Date(shareLink.expiredAt), 'yyyy-MM-dd HH:mm')}</span>}</td>
      <td>{shareLink.description}</td>
      <td>
        <button className="btn btn-outline-warning" type="button" onClick={onDelete}>
          <i className="icon-trash"></i>{t('Delete')}
        </button>
      </td>
    </tr>
  );
};


const ShareLinkList = (props) => {

  const { t } = useTranslation();

  function renderShareLinks() {
    return (
      <>
        {props.shareLinks.map(shareLink => (
          <ShareLinkTr
            isAdmin={props.isAdmin}
            shareLink={shareLink}
            onDelete={() => {
              if (props.onClickDeleteButton == null) {
                return;
              }
              props.onClickDeleteButton(shareLink._id);
            }}
          />
        ))}
      </>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>{t('share_links.Share Link')}</th>
            {props.isAdmin && <th>{t('share_links.Page Path')}</th>}
            <th>{t('share_links.expire')}</th>
            <th>{t('share_links.description')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {renderShareLinks()}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const ShareLinkListWrapper = withUnstatedContainers(ShareLinkList, [AppContainer]);

ShareLinkList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  shareLinks: PropTypes.array.isRequired,
  onClickDeleteButton: PropTypes.func,
  isAdmin: PropTypes.bool,
};

export default withTranslation()(ShareLinkListWrapper);
