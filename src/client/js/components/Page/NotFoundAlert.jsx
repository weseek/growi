import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const NotFoundAlert = (props) => {
  const { t, isForbidden, isNotCreatable } = props;
  function clickHandler(viewType) {
    if (props.onPageCreateClicked === null) {
      return;
    }
    props.onPageCreateClicked(viewType);
  }

  if (isForbidden || isNotCreatable) {
    return null;
  }

  return (
    <div className="border border-info m-4 p-3">
      <div className="col-md-12 p-0">
        <h2 className="text-info lead">
          <i className="icon-info pr-2 font-weight-bold" aria-hidden="true"></i>
          {t('not_found_page.page_not_exist_alert')}
        </h2>
        <button
          type="button"
          className="m-1 pl-3 pr-3 btn bg-info text-white"
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
  isForbidden: PropTypes.bool.isRequired,
  isNotCreatable: PropTypes.bool.isRequired,
};

export default withTranslation()(NotFoundAlert);
