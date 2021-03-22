import { VFC } from 'react';
import dateFnsFormat from 'date-fns/format';

import CopyDropdown from '~/client/js/components/Page/CopyDropdown';
import { ShareLink } from '~/interfaces/page';
import { useTranslation } from '~/i18n';

type Props = {
  shareLinks: ShareLink[]
  isAdmin: boolean,
  onClickDeleteButton: (shareLinkId:string) => void,
};
export const ShareLinkList:VFC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const deleteLinkHandler = (shareLinkId) => {
    if (props.onClickDeleteButton != null) {
      props.onClickDeleteButton(shareLinkId);
    }
  };

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
          {props.shareLinks.map(shareLink => (
            <tr key={shareLink._id}>
              <td>
                <div className="d-flex">
                  <span className="mr-auto my-auto">{shareLink._id}</span>
                  <CopyDropdown
                    pagePath={shareLink.relatedPage.path}
                    dropdownToggleId={`copydropdown-${shareLink._id}`}
                    pageId={shareLink._id}
                    isShareLinkMode
                  >
                    Copy Link
                  </CopyDropdown>
                </div>
              </td>
              {props.isAdmin && <td><a href={shareLink.relatedPage.path}>{shareLink.relatedPage.path}</a></td>}
              <td>{shareLink.expiredAt && <span>{dateFnsFormat(new Date(shareLink.expiredAt), 'yyyy-MM-dd HH:mm')}</span>}</td>
              <td>{shareLink.description}</td>
              <td>
                <button className="btn btn-outline-warning" type="button" onClick={() => deleteLinkHandler(shareLink._id)}>
                  <i className="icon-trash"></i>{t('Delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
