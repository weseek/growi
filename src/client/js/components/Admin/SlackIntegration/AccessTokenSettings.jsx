import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class AccessTokenSettings extends React.Component {

  updateHandler() {
    console.log('Update button pressed');
  }

  discardHandler() {
    console.log('Generate button pressed');
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="form-group row my-5">
          <label className="text-left text-md-right col-md-3 col-form-label">Access Token</label>
          <div className="col-md-6">
            <input className="form-control" type="text" placeholder="access-token" />
          </div>
        </div>

        <div className="row">
          <div className="mx-auto">
            <button type="button" className="btn btn-outline-secondary text-nowrap mx-1" onClick={this.discardHandler}>
              {t('admin:slack_integration.access_token_settings.discard')}
            </button>
            <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={this.updateHandler}>
              {t('admin:slack_integration.access_token_settings.generate')}
            </button>
          </div>
        </div>
      </Fragment>
    );
  }

}

AccessTokenSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(AccessTokenSettings);
