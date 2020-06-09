import React from 'react';

import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

class ShareLinkForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      expirationType: 'unlimited',
      numberOfDays: 7,
      description: '',
      customExpiration: dateFnsFormat(new Date(), 'yyyy-MM-ddThh:mm:s'),
    };

    this.handleChangeExpirationType = this.handleChangeExpirationType.bind(this);
    this.handleChangeNumberOfDays = this.handleChangeNumberOfDays.bind(this);
    this.handleChangeDescription = this.handleChangeDescription.bind(this);
    this.handleIssueShareLink = this.handleIssueShareLink.bind(this);
  }

  /**
   * change expirationType
   * @param {string} expirationType
   */
  handleChangeExpirationType(expirationType) {
    this.setState({ expirationType });
  }

  /**
   * change numberOfDays
   * @param {number} numberOfDays
   */
  handleChangeNumberOfDays(numberOfDays) {
    this.setState({ numberOfDays });
  }

  /**
   * change description
   * @param {string} description
   */
  handleChangeDescription(description) {
    this.setState({ description });
  }

  /**
   * change customExpiration
   * @param {date} customExpiration
   */
  handleChangeCustomExpiration(customExpiration) {
    this.setState({ customExpiration });
  }

  handleIssueShareLink() {
    // use these options
    console.log(this.state);
    console.log('発行する!');
  }

  renderExpirationTypeOptions() {
    const { expirationType } = this.state;

    return (
      <div className="form-group">
        <div className="custom-control custom-radio offset-4 mb-2">
          <input
            type="radio"
            className="custom-control-input"
            id="customRadio1"
            name="expirationType"
            value="customRadio1"
            checked={expirationType === 'unlimited'}
            onChange={() => { this.handleChangeExpirationType('unlimited') }}
          />
          <label className="custom-control-label" htmlFor="customRadio1">Unlimited</label>
        </div>

        <div className="custom-control custom-radio offset-4 mb-2">
          <input
            type="radio"
            className="custom-control-input"
            id="customRadio2"
            value="customRadio2"
            checked={expirationType === 'numberOfDays'}
            onChange={() => { this.handleChangeExpirationType('numberOfDays') }}
            name="expirationType"
          />
          <label className="custom-control-label" htmlFor="customRadio2">
            <div className="row align-items-center m-0">
              <input
                type="number"
                min="1"
                className="col-4"
                name="expirationType"
                value={this.state.numberOfDays}
                onFocus={() => { this.handleChangeExpirationType('numberOfDays') }}
                onChange={e => this.handleChangeNumberOfDays(Number(e.target.value))}
              />
              <span className="col-auto">Days</span>
            </div>
          </label>
        </div>

        <div className="custom-control custom-radio offset-4 mb-2">
          <input
            type="radio"
            className="custom-control-input"
            id="customRadio3"
            name="expirationType"
            value="customRadio3"
            checked={expirationType === 'custom'}
            onChange={() => { this.handleChangeExpirationType('custom') }}
          />
          <label className="custom-control-label" htmlFor="customRadio3">
            Custom
          </label>
          <input
            type="datetime-local"
            className="ml-3"
            name="customExpiration"
            value={this.state.customExpiration}
            onFocus={() => { this.handleChangeExpirationType('custom') }}
            onChange={e => this.handleChangeCustomExpiration(e.target.value)}
          />
        </div>
      </div>
    );
  }

  renderDescriptionForm() {
    return (
      <div className="form-group row">
        <label htmlFor="inputDesc" className="col-md-4 col-form-label">Description</label>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            id="inputDesc"
            placeholder="Enter description"
            value={this.state.description}
            onChange={e => this.handleChangeDescription(e.target.value)}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="share-link-form border p-3">
        <h4>Expiration Date</h4>
        {this.renderExpirationTypeOptions()}
        <hr />
        {this.renderDescriptionForm()}
        <div className="text-right">
          <button type="button" className="btn btn-primary" onClick={this.handleIssueShareLink}>
            Issue
          </button>
        </div>
      </div>
    );
  }

}

const ShareLinkFormWrapper = (props) => {
  return createSubscribedElement(ShareLinkForm, props, [AppContainer, PageContainer]);
};

export default withTranslation()(ShareLinkFormWrapper);
