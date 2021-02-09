import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const RenamedAlert = (props) => {
  const { t } = props;

  return (
    <>
      <strong>{ t('Moved') }:</strong>{t('page_page.notice.moved')}
    </>
  );
};

RenamedAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(RenamedAlert);
