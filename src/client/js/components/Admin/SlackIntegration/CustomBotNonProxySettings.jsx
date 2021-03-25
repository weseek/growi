import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

class CustomBotNonProxySettings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      secretState: '',
      authState: '',
    };
    this.updateHandler = this.updateHandler.bind(this);
  }

  updateHandler() {
    console.log(`Signing Secret: ${this.state.secretState}, Bot User OAuth Token: ${this.state.authState}`);
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="row my-5">
          <div className="mx-auto">
            <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
              {t('admin:slack_integration.non_proxy.create_bot')}
            </button>
          </div>
        </div>

        <div className="form-group row">
          <label className="text-left text-md-right col-md-3 col-form-label">Signing Secret</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              onChange={(e) => { this.state.secretState = e.target.value }}
            />
          </div>
        </div>

        <div className="form-group row mb-5">
          <label className="text-left text-md-right col-md-3 col-form-label">Bot User OAuth Token</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              onChange={(e) => { this.state.authState = e.target.value }}
            />
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.updateHandler} disabled={false} />
      </Fragment>
    );
  }

}

CustomBotNonProxySettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(CustomBotNonProxySettings);
