import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeKibelaLayout extends React.Component {

  render() {
    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input type="radio" id="radioLayoutKibela" checked={this.props.currentLayout === 'kibela'} onChange={() => this.props.onChangeLayout('kibela')} />
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

}

CustomizeKibelaLayout.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  currentLayout: PropTypes.string.isRequired,
  onChangeLayout: PropTypes.func.isRequired,
};

export default withTranslation()(CustomizeKibelaLayout);
