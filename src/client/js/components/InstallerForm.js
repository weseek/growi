import React from 'react';
import PropTypes from 'prop-types';

export default class InstallerForm extends React.Component {
  render() {
    return (
      <div>
        <div className="input-group" id="input-group-username">
          <span className="input-group-addon"><i className="icon-user"></i></span>
          <input type="text" className="form-control" placeholder="{{ t('User ID') }}" name="registerForm[username]" value="{{ req.body.registerForm.username }}" required />
        </div>
        <p className="help-block">
          <span id="help-block-username"></span>
        </p>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-tag"></i></span>
          <input type="text" className="form-control" placeholder="{{ t('Name') }}" name="registerForm[name]" value="{{ googleName|default(req.body.registerForm.name) }}" required />
        </div>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-envelope"></i></span>
          <input type="email" className="form-control" placeholder="{{ t('Email') }}" name="registerForm[email]" value="{{ googleEmail|default(req.body.registerForm.email) }}" required />
        </div>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-lock"></i></span>
          <input type="password" className="form-control" placeholder="{{ t('Password') }}" name="registerForm[password]" required />
        </div>

        <input type="hidden" name="_csrf" value="{{ csrf() }}" />
        <div className="input-group m-t-30 m-b-20 d-flex justify-content-center">
          <button type="submit" className="fcbtn btn btn-success btn-1b btn-register">
            <span className="btn-label"><i className="icon-user-follow"></i></span>
            {{ t('Create') }}
          </button>
        </div>
      </div>
    );
  }
}

InstallerForm.propTypes = {
};
