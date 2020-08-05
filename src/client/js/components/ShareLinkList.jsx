import React from 'react';
import PropTypes from 'prop-types';


import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import CopyDropdown from './Page/CopyDropdown';

const ShareLinkList = (props) => {

  const { t } = props;
  function deleteLinkHandler(shareLinkId) {
    if (props.onClickDeleteButton == null) {
      return;
    }
    props.onClickDeleteButton(shareLinkId);
  }

  function renderShareLinks() {
    return (
      <>
        {props.shareLinks.map(shareLink => (
          <tr key={shareLink._id}>
            <td>
              <div className="d-flex">
                <span className="mr-auto my-auto">{shareLink._id}</span>
                <CopyDropdown isShareLinkMode pagePath={shareLink.relatedPage.path} pageId={shareLink._id} />
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
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  shareLinks: PropTypes.array.isRequired,
  onClickDeleteButton: PropTypes.func,
  isAdmin: PropTypes.bool,

export default withTranslation()(ShareLinkListWrapper);
