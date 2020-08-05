import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

const ShareLinkAlert = (props) => {
  const { t } = props;


  const shareContent = document.getElementById('is-shared-page');
  let expiredAt = shareContent.getAttribute('data-share-link-expired-at');
  const createdAt = shareContent.getAttribute('data-share-link-created-at');

  function generateRatio() {
    const wholeTime = new Date(expiredAt).getTime() - new Date(createdAt).getTime();
    const remainingTime = new Date(expiredAt).getTime() - new Date().getTime();
    return remainingTime / wholeTime;
  }

  let ratio = 1;

  if (expiredAt !== '') {
    ratio = generateRatio();
  }
  else {
    expiredAt = t('share_links.Unlimited');
  }

  function specifyColor() {
    let color;
    if (ratio >= 0.75) {
      color = 'success';
    }
    else if (ratio < 0.75 && ratio >= 0.5) {
      color = 'info';
    }
    else if (ratio < 0.5 && ratio >= 0.25) {
      color = 'warning';
    }
    else {
      color = 'danger';
    }
    return color;
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
