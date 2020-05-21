import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

const ApiErrorMessage = (props) => {
  const { t, errorCode, linkPath } = props;

  function renderMessage() {
    switch (errorCode) {
      case 'already_exists':
        return (
          <span className="text-danger">
            <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.already_exists') }</strong>
            <small><a href={linkPath}>{linkPath} <i className="icon-login"></i></a></small>
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <>
      {renderMessage()}
    </>
  );

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
  t: PropTypes.func.isRequired, //  i18next
  errorCode: PropTypes.string,
  linkPath: PropTypes.string,
};

export default withTranslation()(ApiErrorMessage);
