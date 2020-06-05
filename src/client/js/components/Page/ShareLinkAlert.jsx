import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

const ShareLinkAlert = (props) => {
  const { t } = props;
  const shareContent = document.getElementById('is-shared-page');
  const expiration = shareContent.getAttribute('data-expiration');

  return (
    <p className="alert alert-pink py-3 px-4">
      <i className="icon-fw icon-link"></i>
      {/* eslint-disable-next-line react/no-danger */}
      <span dangerouslySetInnerHTML={{ __html: t('page_page.notice.expiration', { expiration }) }} />
    </p>
  );
};


ShareLinkAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(ShareLinkAlert);
