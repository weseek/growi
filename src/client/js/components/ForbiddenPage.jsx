import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const ForbiddenPage = (props) => {
  const { t } = props;

  return (
    <>
      <div className="row not-found-message-row mb-4">
        <div className="col-lg-12">
          <h2 className="text-muted">
            <i className="icon-ban" aria-hidden="true"></i>
            {t('forbidden')}
          </h2>
        </div>
      </div>


      <div className="row row-alerts d-edit-none">
        <div className="col-sm-12">
          <p className="alert alert-primary py-3 px-4">
            <i className="icon-fw icon-lock" aria-hidden="true"></i> Browsing of this page is restricted
          </p>
        </div>
      </div>

    </>

  );

};

ForbiddenPage.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(ForbiddenPage);
