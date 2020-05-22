import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

const ApiErrorMessage = (props) => {
  const {
    t, errorCode, errorMessage, linkPath,
  } = props;

  function renderMessageByErrorCode() {
    switch (errorCode) {
      case 'already_exists':
        return (
          <>
            <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.already_exists') }</strong>
            <small><a href={linkPath}>{linkPath} <i className="icon-login"></i></a></small>
          </>
        );
      default:
        return null;
    }
  }

  if (errorCode != null) {
    return (
      <span className="text-danger">
        {renderMessageByErrorCode()}
      </span>
    );
  }

  if (errorMessage != null) {
    return (
      <span className="text-danger">
        {errorMessage}
      </span>
    );
  }

  // render null if no error has occurred
  return null;

  // TODO GW-79 Set according to error message
  // <div>
  //   <span className="text-danger msg msg-notfound_or_forbidden">
  //     <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.notfound_or_forbidden') }</strong>
  //   </span>
  //   <span className="text-danger msg msg-user_not_admin">
  //     <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.user_not_admin') }</strong>
  //   </span>

  //   <span className="text-warning msg msg-outdated">
  //     <strong><i className="icon-fw icon-bulb"></i> { t('page_api_error.outdated') }</strong>
  //     {/* <a href="javascript:location.reload();"> */}
  //     <i className="fa fa-angle-double-right"></i> { t('Load latest') }
  //     {/* </a> */}
  //   </span>
  //   <span className="text-danger msg msg-invalid_path">
  //     <strong><i className="icon-fw icon-ban"></i> Invalid path</strong>
  //   </span>
  //   <span className="text-danger msg msg-unknown">
  //     <strong><i className="icon-fw icon-ban"></i> Unknown error occured</strong>
  //   </span>
  // </div>
};

ApiErrorMessage.propTypes = {
  t:            PropTypes.func.isRequired, //  i18next

  errorCode:    PropTypes.string,
  errorMessage: PropTypes.string,
  linkPath:     PropTypes.string,
};

export default withTranslation()(ApiErrorMessage);
