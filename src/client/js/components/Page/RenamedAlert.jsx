import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const RenamedAlert = (props) => {
  const { t } = props;
  const urlParams = new URLSearchParams(window.location.search);
  const fromPath = urlParams.get('renamedFrom');

  return (
    <>
      <strong>{ t('Moved') }:</strong> {t('page_page.notice.moved')} <code>{fromPath}</code> {t('page_page.notice.moved_period')}
    </>
  );
};

RenamedAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(RenamedAlert);
