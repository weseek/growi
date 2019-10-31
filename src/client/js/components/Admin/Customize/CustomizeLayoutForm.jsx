import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeLayoutForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // TODO GW-477 save setting at customizeContainer
      layout: 'growi',
    };

    this.onChangeLayout = this.onChangeLayout.bind(this);
  }

  onChangeLayout(lauoutName) {
    this.setState({ layout: lauoutName });
  }

  growiLayout() {
    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input type="radio" id="radioLayoutGrowi" checked={this.state.layout === 'growi'} onChange={() => this.onChangeLayout('growi')} />
            <label htmlFor="radioLayoutGrowi">
              GROWI Enhanced Layout <small className="text-success">(Recommended)</small>
            </label>
          </div>
        </h4>
        <a href="/images/admin/customize/layout-crowi-plus.gif" className="ss-container">
          <img src="/images/admin/customize/layout-crowi-plus-thumb.gif" width="240px" />
        </a>
        <h4>Simple and Clear</h4>
        <ul>
          {/* TODO i18n */}
          <li>Full screen layout and thin margins/paddings</li>
          <li>Show and post comments at the bottom of the page</li>
          <li>Affix Table-of-contents</li>
        </ul>
      </div>
    );
  }

  kibelaLayout() {
    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input type="radio" id="radioLayoutKibela" checked={this.state.layout === 'kibela'} onChange={() => this.onChangeLayout('kibela')} />
            <label htmlFor="radioLayoutKibela">
              Kibela Like Layout
            </label>
          </div>
        </h4>
        <a href="/images/admin/customize/layout-kibela.gif" className="ss-container">
          <img src="/images/admin/customize/layout-kibela-thumb.gif" width="240px" />
        </a>
        <h4>Easy Viewing Structure</h4>
        <ul>
          {/* TODO i18n */}
          <li>Center aligned contents</li>
          <li>Show and post comments at the bottom of the page</li>
          <li>Affix Table-of-contents</li>
        </ul>
      </div>
    );
  }

  classicLayout() {
    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input type="radio" id="radioLayoutCrowi" checked={this.state.layout === 'crowi'} onChange={() => this.onChangeLayout('crowi')} />
            <label htmlFor="radioLayoutCrowi">
              Crowi Classic Layout
            </label>
          </div>
        </h4>
        <a href="/images/admin/customize/layout-classic.gif" className="ss-container">
          <img src="/images/admin/customize/layout-classic-thumb.gif" width="240px" />
        </a>
        <h4>Separated Functions</h4>
        <ul>
          {/* TODO i18n */}
          <li>Collapsible Sidebar</li>
          <li>Show and post comments in Sidebar</li>
          <li>Collapsible Table-of-contents</li>
        </ul>
      </div>
    );
  }

  render() {

    return (
      <form>
        {this.growiLayout()}
        {this.kibelaLayout()}
        {this.classicLayout()}
      </form>
    );
  }

}

CustomizeLayoutForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(CustomizeLayoutForm);
