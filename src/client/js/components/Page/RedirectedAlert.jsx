import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const RedirectedAlert = (props) => {
  const { t } = props;

  return (
    <>
      <strong>{ t('Redirected') }:</strong>{ t('page_page.notice.redirected')}
    </>
  );
};

RedirectedAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(RedirectedAlert);
