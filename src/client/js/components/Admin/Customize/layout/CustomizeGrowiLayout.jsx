import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeGrowiLayout extends React.Component {

  render() {
    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input type="radio" id="radioLayoutGrowi" checked={this.props.currentLayout === 'growi'} onChange={() => this.props.onChangeLayout('growi')} />
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

}

CustomizeGrowiLayout.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  currentLayout: PropTypes.string.isRequired,
  onChangeLayout: PropTypes.func.isRequired,
};

export default withTranslation()(CustomizeGrowiLayout);
