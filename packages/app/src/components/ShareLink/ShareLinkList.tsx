import React from 'react';

import dateFnsFormat from 'date-fns/format';
import { useTranslation } from 'next-i18next';

import CopyDropdown from '../Page/CopyDropdown';


type ShareLinkTrProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shareLink: any,
  isAdmin?: boolean,
  onDelete?: () => void,
}

const ShareLinkTr = (props: ShareLinkTrProps): JSX.Element => {
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


type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shareLinks: any[],
  onClickDeleteButton?: (shareLinkId: string) => void,
  isAdmin?: boolean,
}

const ShareLinkList = (props: Props): JSX.Element => {

  const { t } = useTranslation();

  function renderShareLinks() {
    return (
      <>
        {props.shareLinks.map(shareLink => (
          <ShareLinkTr
            key={shareLink._id}
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

export default ShareLinkList;
