import React from 'react';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';


import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import loggerFactory from '@alias/logger';
const logger = loggerFactory('growi:app');

class ShareLinkForm extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      value: ' '
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    console.log( event.target.value) ;
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log( '発行する!' );
  }


  render() {
    return (
      <div className="share-link-form border">
        <h4 className="ml-3">Expiration Date</h4>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <div className="custom-control custom-radio offset-4 mb-2">
              <input id="customRadio1" name="customRadio" type="radio" className="custom-control-input"></input>
              <label className="custom-control-label" htmlFor="customRadio1">Unlimited</label>
            </div>

            <div className="custom-control custom-radio offset-4 mb-2">
              <input id="customRadio2" name="customRadio" type="radio" className="custom-control-input"></input>
              <label className="custom-control-label" htmlFor="customRadio2">
                <div className="row align-items-center m-0">
                  <input className="form-control col-2" type="number" min="1" max="7" value="7"></input>
                  <span className="col-auto">Days</span>
                </div>
              </label>
            </div>

            <div className="custom-control custom-radio offset-4 mb-2">
              <input id="customRadio3" name="customRadio" type="radio" className="custom-control-input"></input>
              <label className="custom-control-label" htmlFor="customRadio3">
                Custom
              <div className="date-picker">Date Picker</div>
              </label>
            </div>

            <hr />

            <div className="form-group row">
              <label htmlFor="inputDesc" className="col-md-4 col-form-label">Description</label>
              <div className="col-md-4">
                <input type="text" className="form-control" id="inputDesc" placeholder="Enter description" value={this.state.value} onChange={this.handleChange}></input>
              </div>
            </div>

            <div className="form-group row">
              <div className="offset-8 col">
                <button type="button" className="btn btn-primary" type="submit" value="Submit" >Issue</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };
}

const ShareLinkFormWrapper = (props) => {
  return createSubscribedElement(ShareLinkForm, props, [AppContainer, PageContainer]);
};

export default withTranslation()(ShareLinkFormWrapper);
