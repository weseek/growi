import React from 'react';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';


import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

const ShareLinkForm = (props) => {
  return (
    <div className="share-link-form border p-3">
      <h4>Expiration Date</h4>
      <form>
        <fieldset className="form-group">
          <div className="row">
            <legend className="col-form-label col-3"></legend>
            <div>
              <div className="custom-control custom-radio mb-2">
                <input id="customRadio1" name="customRadio" type="radio" className="custom-control-input"></input>
                <label className="custom-control-label" htmlFor="customRadio1">Unlimited</label>
              </div>

              <div className="custom-control custom-radio mb-2">
                <input id="customRadio2" name="customRadio" type="radio" className="custom-control-input"></input>
                <label className="custom-control-label" htmlFor="customRadio2">
                  <div className="row align-items-center m-0">
                    <input className="form-control col-2" type="number" min="1" max="7" value="7"></input>
                    <span className="col-auto">Days</span>
                  </div>
                </label>
              </div>

              <div className="custom-control custom-radio mb-2">
                <input id="customRadio3" name="customRadio" type="radio" className="custom-control-input"></input>
                <label className="custom-control-label" htmlFor="customRadio3">
                  Custom
                  <div className="date-picker">Date Picker</div>
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        <hr />

        <div className="form-group row">
          <label htmlFor="inputDesc" className="offset-3 col-form-label">Description</label>
          <div className="col-5">
            <input type="text" className="form-control" id="inputDesc" placeholder="Enter description"></input>
          </div>
        </div>

        <div className="form-inline">
          <button type="button" className="ml-auto btn btn-primary">Issue</button>
        </div>
      </form>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const ShareLinkFormWrapper = withUnstatedContainers(ShareLinkForm, [AppContainer, PageContainer]);

export default withTranslation()(ShareLinkFormWrapper);
