/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class XssForm extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;

    this.state = {
      isEnabledXss: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  }

  xssOptions() {
    return (
      <p>hello</p>
    )
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <form className="row">
          <div className="form-group">
            <label className="col-xs-4 control-label text-right">
              { t('markdown_setting.Enable XSS prevention') }
            </label>
            <div className="col-xs-5">
              <input type="checkbox" name="isEnabledXss" checked={this.state.isEnabledXss} onChange={this.handleInputChange} />
            </div>
          </div>
          {this.state.isEnabledXss && this.xssOptions()}
          <div className="form-group my-3">
            <div className="col-xs-offset-4 col-xs-5">
              <button type="submit" className="btn btn-primary">{ t('Update') }</button>
            </div>
          </div>
        </form>
      </React.Fragment>
    );
  }

}

const XssFormWrapper = (props) => {
  return createSubscribedElement(XssForm, props, [AppContainer]);
};

XssForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

};

export default withTranslation()(XssFormWrapper);
