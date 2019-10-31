import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeCrowiLayout extends React.Component {

  render() {
    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input type="radio" id="radioLayoutCrowi" checked={this.props.currentLayout === 'crowi'} onChange={() => this.props.onChangeLayout('crowi')} />
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

}

CustomizeCrowiLayout.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  currentLayout: PropTypes.string.isRequired,
  onChangeLayout: PropTypes.func.isRequired,
};

export default withTranslation()(CustomizeCrowiLayout);
