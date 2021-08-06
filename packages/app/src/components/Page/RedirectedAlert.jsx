import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const RedirectedAlert = (props) => {
  const { t } = props;
  const urlParams = new URLSearchParams(window.location.search);
  const fromPath = urlParams.get('redirectFrom');

  return (
    <>
      <strong>{ t('Redirected') }:</strong> { t('page_page.notice.redirected')} <code>{fromPath}</code> {t('page_page.notice.redirected_period')}
    </>
  );
};

RedirectedAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(RedirectedAlert);
