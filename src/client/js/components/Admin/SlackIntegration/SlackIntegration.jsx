import React, { Fragment } from 'react';
// import PropTypes from 'prop-types';

// import { withUnstatedContainers } from '../../UnstatedUtils';
// import AppContainer from '../../../services/AppContainer';
class SlackIntegration extends React.Component {

  updateHandler() {
    console.log('Update button pressed');
  }

  discardHandler() {
    console.log('Discard button pressed');
  }

  render() {
    // const { t } = this.props;

    return (
      <Fragment>
        <div className="row">
          <div className="col-lg-12">
            {/* <h2 className="admin-setting-header">{t('Access Token')}</h2> */}
            <h2 className="admin-setting-header">Access Token</h2>

            <div className="form-group row">
              {/* <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:app_setting.site_name')}</label> */}
              <label className="text-left text-md-right col-md-3 col-form-label">Access Token</label>
              <div className="col-md-6">
                <input className="form-control" type="text" placeholder="access-token" />
              </div>
            </div>

            <div className="row my-3">
              <div className="offset-4 col-5">
                <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={this.updateHandler}>
                  Update
                </button>
                <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={this.discardHandler}>
                  Discard
                </button>
              </div>

            </div>
          </div>
        </div>
      </Fragment>
    );
  }

}

// const SlackIntegrationWrapper = withUnstatedContainers(SlackIntegration, [AppContainer]);

// SlackIntegration.propTypes = {
//   t: PropTypes.func.isRequired, // i18next
//   appContainer: PropTypes.instanceOf(AppContainer).isRequired,
// slackIntegrationContainer: PropTypes.instanceOf(SlackIntegrationContainer).isRequired,
// };

export default SlackIntegration;
