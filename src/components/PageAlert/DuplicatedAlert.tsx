import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const DuplicatedAlert = (props) => {
  const { t } = props;
  const urlParams = new URLSearchParams(window.location.search);
  const fromPath = urlParams.get('duplicated');

  return (
    <div className="alert alert-success py-3 px-4">
      <strong>
        { t('Duplicated') }: {t('page_page.notice.duplicated')} <code>{fromPath}</code> {t('page_page.notice.duplicated_period')}
      </strong>
    </div>
  );
};

DuplicatedAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(DuplicatedAlert);
