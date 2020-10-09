import React from 'react';
import PropTypes from 'prop-types';

const NotFoundAlert = (props) => {

  function clickHandler(viewType) {
    if (props.onPageCreateClicked === null) {
      return;
    }
    props.onPageCreateClicked(viewType);
  }

  return (
    <div className="grw-not-found-alert border m-4 p-4">
      <div className="col-md-12">
        <h2 className="text-muted not-found-text">
          <i className="icon-info" aria-hidden="true"></i>
          {/* Todo make the message supported by i18n GW4050 */ }
          このページは存在しません。新たに作成する必要があります。
        </h2>
        <button
          type="button"
          className="m-2 p-2"
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
