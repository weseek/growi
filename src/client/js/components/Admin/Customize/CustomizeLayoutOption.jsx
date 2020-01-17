import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeLayoutOption extends React.Component {

  render() {
    const { layoutType } = this.props;

    return (
      <React.Fragment>
        <h4>
          <div className="radio radio-primary">
            <input type="radio" id={`radio-layout-${layoutType}`} checked={this.props.isSelected} onChange={this.props.onSelected} />
            <label htmlFor={`radio-layout-${layoutType}`}>
              {/* eslint-disable-next-line react/no-danger */}
              <span dangerouslySetInnerHTML={{ __html: this.props.labelHtml }} />
            </label>
          </div>
        </h4>
        <a href={`/images/admin/customize/layout-${layoutType}.gif`} className="ss-container">
          <img src={`/images/admin/customize/layout-${layoutType}-thumb.gif`} width="240px" />
        </a>
        {/* render layout description */}
        {this.props.children}
      </React.Fragment>
    );
  }

}

CustomizeLayoutOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  layoutType: PropTypes.string.isRequired,
  labelHtml: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelected: PropTypes.func.isRequired,
  children: PropTypes.array.isRequired,
};

export default withTranslation()(CustomizeLayoutOption);
