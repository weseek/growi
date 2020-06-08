import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

const ShareLinkAlert = (props) => {
  const { t } = props;
  const shareContent = document.getElementById('is-shared-page');
  const expiredAt = shareContent.getAttribute('data-share-link-expired-at');
  const createdAt = shareContent.getAttribute('data-share-link-created-at');
  const wholeTime = new Date(expiredAt).getTime() - new Date(createdAt).getTime();
  const remainingTime = new Date(expiredAt).getTime() - new Date().getTime();
  const percentage = remainingTime / wholeTime * 100;

  function specifyColor() {
    if (percentage >= 75) {
      return 'success';
    } if (percentage >= 50) {
      return 'info';
    } if (percentage >= 25) {
      return 'warning';
    }
    return 'danger';
  }

  return (
    <p className={`alert alert-${specifyColor()} py-3 px-4`}>
      <i className="icon-fw icon-link"></i>
      {/* eslint-disable-next-line react/no-danger */}
      <span dangerouslySetInnerHTML={{ __html: t('page_page.notice.expiration', { expiredAt }) }} />
    </p>
  );
};


ShareLinkAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(ShareLinkAlert);
