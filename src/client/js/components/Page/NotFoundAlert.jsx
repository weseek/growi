import React from 'react';
import PropTypes from 'prop-types';

const NotFoundAlert = (props) => {

  function clickHandler(viewType) {
    if (props.onPageCreateClicked) {
      props.onPageCreateClicked(viewType);
    }
    else {
      return null;
    }
  }

  return (
    <div className="grw-not-found-alert m-4 p-4">
      <div className="col-md-12">
        <h2 className="not-found-alert-text lead">
          <i className="icon-info" aria-hidden="true"></i>
          {/* Todo make the message supported by i18n GW4050 */ }
          このページは存在しません。新たに作成する必要があります。
        </h2>
        <button
          type="button"
          className="m-2 p-2 btn create-page-btn"
          onClick={() => { clickHandler('edit') }}
        >
          <i className="icon-note icon-fw" />
          {/* Todo make the message supported by i18n GW4050 */ }
          ページを作成する
        </button>
      </div>
    </div>
  );
};


NotFoundAlert.propTypes = {
  onPageCreateClicked: PropTypes.func,
};


export default NotFoundAlert;
