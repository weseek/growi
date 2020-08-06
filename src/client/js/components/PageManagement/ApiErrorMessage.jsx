import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import toArrayIfNot from '../../../../lib/util/toArrayIfNot';

const ApiErrorMessage = (props) => {
  const {
    t, errors, targetPath,
  } = props;

  function reload() {
    window.location.reload();
  }

  if (errors == null) {
    return null;
  }

  const errArray = toArrayIfNot(errors);

  function renderMessage(err) {

    function renderMessageByErrorCode() {
      switch (err.code) {
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
        default:
          return (
            <strong><i className="icon-fw icon-ban"></i> Unknown error occured</strong>
          );
      }
    }

    if (err.code != null) {
      return renderMessageByErrorCode();
    }

    if (err.message != null) {
      return err.message;
    }

  }

  return (
    <>
      {errArray.map((error) => {
        return (
          <span key={error.message} className="text-danger">
            {renderMessage(error)}
          </span>
        );
      })}
    </>
  );

};

ApiErrorMessage.propTypes = {
  t:            PropTypes.func.isRequired, //  i18next

  errors:       PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  targetPath:   PropTypes.string,
};

export default withTranslation()(ApiErrorMessage);
