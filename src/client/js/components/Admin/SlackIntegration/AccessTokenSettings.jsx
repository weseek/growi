import React, { Fragment } from 'react';

class AccessTokenSettings extends React.Component {

  updateHandler() {
    console.log('Update button pressed');
  }

  discardHandler() {
    console.log('Generate button pressed');
  }

  render() {
    return (
      <Fragment>
        <div className="form-group row my-5">
          {/* <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:app_setting.site_name')}</label> */}
          <label className="text-left text-md-right col-md-3 col-form-label">Access Token</label>
          <div className="col-md-6">
            <input className="form-control" type="text" placeholder="access-token" />
          </div>
        </div>

        <div className="row">
          <div className="mx-auto">
            <button type="button" className="btn btn-outline-secondary text-nowrap mx-1" onClick={this.discardHandler}>
              Discard
            </button>
            <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={this.updateHandler}>
              Generate
            </button>
          </div>
        </div>
      </Fragment>
    );
  }

}

export default AccessTokenSettings;
