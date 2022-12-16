import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

const ApiErrorMessage = (props) => {
  const { t } = useTranslation();
  const {
    errorCode, errorMessage, targetPath,
  } = props;

  function reload() {
    window.location.reload();
  }

  function renderMessageByErrorCode() {
    switch (errorCode) {
      case 'already_exists':
        return (
          <>
            <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.already_exists') }</strong>
            <small><a href={targetPath}>{targetPath} <i className="icon-login"></i></a></small>
          </>
        );
      case 'notfound_or_forbidden':
        return (
          <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.notfound_or_forbidden') }</strong>
        );
      case 'user_not_admin':
        return (
          <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.user_not_admin') }</strong>
        );
      case 'outdated':
        return (
          <>
            <strong><i className="icon-fw icon-bulb"></i> { t('page_api_error.outdated') }</strong>
            <a className="btn-link" onClick={reload}>
              <i className="fa fa-angle-double-right"></i> { t('Load latest') }
            </a>
          </>
        );
      case 'invalid_path':
        return (
          <strong><i className="icon-fw icon-ban"></i> Invalid path</strong>
        );
      case 'single_deletion_empty_pages':
        return (
          <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.single_deletion_empty_pages') }</strong>
        );
      default:
        return (
          <strong><i className="icon-fw icon-ban"></i> Unknown error occured</strong>
        );
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

};

ApiErrorMessage.propTypes = {
  errorCode:    PropTypes.string,
  errorMessage: PropTypes.string,
  targetPath:   PropTypes.string,
};

export default ApiErrorMessage;
