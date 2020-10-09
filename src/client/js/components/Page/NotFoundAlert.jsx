import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const NotFoundAlert = (props) => {
  const { t } = props;
  function clickHandler(viewType) {
    if (props.onPageCreateClicked === null) {
      return;
    }
    props.onPageCreateClicked(viewType);
  }

  return (
    <div className="grw-not-found-alert m-4 p-4">
      <div className="col-md-12">
        <h2 className="not-found-alert-text lead">
          <i className="icon-info" aria-hidden="true"></i>
          {t('not_found_page.page_not_exist_alert')}
        </h2>
        <button
          type="button"
          className="m-2 p-2 btn create-page-btn"
          onClick={() => { clickHandler('edit') }}
        >
          <i className="icon-note icon-fw" />
          {t('not_found_page.Create Page')}
        </button>
      </div>
    </div>
  );
};


NotFoundAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  onPageCreateClicked: PropTypes.func,
};

export default withTranslation()(NotFoundAlert);
