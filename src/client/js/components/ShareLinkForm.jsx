import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';
import parse from 'date-fns/parse';

import { withUnstatedContainers } from './UnstatedUtils';

import { toastSuccess, toastError } from '../util/apiNotification';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

class ShareLinkForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      expirationType: 'unlimited',
      numberOfDays: 7,
      description: '',
      customExpirationDate: dateFnsFormat(new Date(), 'yyyy-MM-dd'),
      customExpirationTime: dateFnsFormat(new Date(), 'hh:mm:s'),
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
   * change customExpirationDate
   * @param {date} customExpirationDate
   */
  handleChangeCustomExpirationDate(customExpirationDate) {
    this.setState({ customExpirationDate });
  }

  /**
   * change customExpirationTime
   * @param {date} customExpirationTime
   */
  handleChangeCustomExpirationTime(customExpirationTime) {
    this.setState({ customExpirationTime });
  }

  /**
   * Generate expiredAt by expirationType
   */
  generateExpired() {
    const { expirationType } = this.state;
    let expiredAt;

    if (expirationType === 'unlimited') {
      return null;
    }

    if (expirationType === 'numberOfDays') {
      const date = new Date();
      date.setDate(date.getDate() + this.state.numberOfDays);
      expiredAt = date;
    }

    if (expirationType === 'custom') {
      const { customExpirationDate, customExpirationTime } = this.state;
      expiredAt = parse(`${customExpirationDate}T${customExpirationTime}`, "yyyy-MM-dd'T'HH:mm:ss", new Date());
    }

    return expiredAt;
  }

  closeForm() {
    const { onCloseForm } = this.props;

    if (onCloseForm == null) {
      return;
    }
    onCloseForm();
  }

  async handleIssueShareLink() {
    const { t, pageContainer } = this.props;
    const { pageId } = pageContainer.state;
    const { description } = this.state;

    let expiredAt;

    try {
      expiredAt = this.generateExpired();
    }
    catch (err) {
      return toastError(err);
    }

    try {
      await this.props.appContainer.apiv3.post('/share-links/', { relatedPage: pageId, expiredAt, description });
      this.closeForm();
      toastSuccess(t('toaster.issue_share_link'));
    }
    catch (err) {
      toastError(err);
    }

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
            type="date"
            className="ml-3"
            name="customExpirationDate"
            value={this.state.customExpirationDate}
            onFocus={() => { this.handleChangeExpirationType('custom') }}
            onChange={e => this.handleChangeCustomExpirationDate(e.target.value)}
          />
          <input
            type="time"
            className="ml-3"
            name="customExpiration"
            value={this.state.customExpirationTime}
            onFocus={() => { this.handleChangeExpirationType('custom') }}
            onChange={e => this.handleChangeCustomExpirationTime(e.target.value)}
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

const ShareLinkFormWrapper = withUnstatedContainers(ShareLinkForm, [AppContainer, PageContainer]);

ShareLinkForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  user: PropTypes.object.isRequired,
  onCloseForm: PropTypes.func,
};

export default withTranslation()(ShareLinkFormWrapper);
