import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeBehaviorOption extends React.PureComponent {

  render() {

    return (
      <div className="col-xs-6">
        <h4>
          <div className="radio radio-primary">
            <input type="radio" id={`radioBehavior${this.props.behaviorType}`} checked={this.props.isSelected} onChange={this.props.onSelected} />
            <label htmlFor={`radioBehavior${this.props.behaviorType}`}>
              {/* eslint-disable-next-line react/no-danger */}
              <span dangerouslySetInnerHTML={{ __html: this.props.labelHtml }} />
            </label>
          </div>
        </h4>
        {/* render layout description */}
        {this.props.children}
      </div>
    );
  }

}

CustomizeBehaviorOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  behaviorType: PropTypes.string.isRequired,
  labelHtml: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelected: PropTypes.func.isRequired,
  children: PropTypes.object.isRequired,
};

export default withTranslation()(CustomizeBehaviorOption);
