import React from 'react';
import PropTypes from 'prop-types';

import i18next from 'i18next';
import { withTranslation } from 'react-i18next';

// TODO: GW-333
// import FormGroup from 'react-bootstrap/es/FormGroup';
// import Radio from 'react-bootstrap/es/Radio';

class InstallerForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isValidUserName: true,
      checkedBtn: 'en-US',
    };
    this.checkUserName = this.checkUserName.bind(this);
  }

  componentWillMount() {
    this.changeLanguage('en-US');
  }

  checkUserName(event) {
    const axios = require('axios').create({
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      responseType: 'json',
    });
    axios.get('/_api/check_username', { params: { username: event.target.value } })
      .then((res) => { return this.setState({ isValidUserName: res.data.valid }) });
  }

  changeLanguage(locale) {
    i18next.changeLanguage(locale);
    this.setState({ checkedBtn: locale });
  }

  render() {
    const hasErrorClass = this.state.isValidUserName ? '' : ' has-error';
    const unavailableUserId = this.state.isValidUserName
      ? ''
      : <span><i className="icon-fw icon-ban" />{ this.props.t('installer.unavaliable_user_id') }</span>;

    const checkedBtn = this.state.checkedBtn;

    return (
      <div className={`login-dialog p-t-10 p-b-10 col-sm-offset-4 col-sm-4${hasErrorClass}`}>
        <p className="alert alert-success">
          <strong>{ this.props.t('installer.create_initial_account') }</strong><br />
          <small>{ this.props.t('installer.initial_account_will_be_administrator_automatically') }</small>
        </p>

        <form role="form" action="/installer" method="post" id="register-form">
          <FormGroup className="text-center">
            <Radio
              name="registerForm[app:globalLang]"
              value="en-US"
              checked={checkedBtn === 'en-US'}
              inline
              onChange={(e) => { if (e.target.checked) { this.changeLanguage('en-US') } }}
            >
              English
            </Radio>
            <Radio
              name="registerForm[app:globalLang]"
              value="ja"
              checked={checkedBtn === 'ja'}
              inline
              onChange={(e) => { if (e.target.checked) { this.changeLanguage('ja') } }}
            >
              日本語
            </Radio>
          </FormGroup>

          <div className={`input-group${hasErrorClass}`}>
            <span className="input-group-addon"><i className="icon-user" /></span>
            <input
              type="text"
              className="form-control"
              placeholder={this.props.t('User ID')}
              name="registerForm[username]"
              defaultValue={this.props.userName}
              onBlur={this.checkUserName}
              required
            />
          </div>
          <p className="help-block">{ unavailableUserId }</p>

          <div className="input-group">
            <span className="input-group-addon"><i className="icon-tag" /></span>
            <input
              type="text"
              className="form-control"
              placeholder={this.props.t('Name')}
              name="registerForm[name]"
              defaultValue={this.props.name}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-group-addon"><i className="icon-envelope" /></span>
            <input
              type="email"
              className="form-control"
              placeholder={this.props.t('Email')}
              name="registerForm[email]"
              defaultValue={this.props.email}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-group-addon"><i className="icon-lock" /></span>
            <input
              type="password"
              className="form-control"
              placeholder={this.props.t('Password')}
              name="registerForm[password]"
              required
            />
          </div>

          <input type="hidden" name="_csrf" value={this.props.csrf} />

          <div className="input-group m-t-30 m-b-20 d-flex justify-content-center">
            <button type="submit" className="fcbtn btn btn-success btn-1b btn-register">
              <span className="btn-label"><i className="icon-user-follow" /></span>
              <span className="btn-label-text">{ this.props.t('Create') }</span>
            </button>
          </div>

          <div className="input-group m-t-30 d-flex justify-content-center">
            <a href="https://growi.org" className="link-growi-org">
              <span className="growi">GROWI</span>.<span className="org">ORG</span>
            </a>
          </div>
        </form>
      </div>
    );
  }

}

InstallerForm.propTypes = {
  // i18next
  t: PropTypes.func.isRequired,
  // for input value
  userName: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  csrf: PropTypes.string,
};

export default withTranslation()(InstallerForm);
