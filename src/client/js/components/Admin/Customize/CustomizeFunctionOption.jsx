import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeFunctionOption extends React.PureComponent {

  render() {
    return (
      <React.Fragment>
        <div className="checkbox checkbox-success">
          <input
            type="checkbox"
            id={this.props.optionId}
            checked={this.props.isChecked}
            onChange={this.props.onChecked}
          />
          <label htmlFor={this.props.optionId}>
            <strong>{this.props.label}</strong>
          </label>
        </div>
        {this.props.children}
      </React.Fragment>
    );
  }

}

CustomizeFunctionOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  optionId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isChecked: PropTypes.bool.isRequired,
  onChecked: PropTypes.func.isRequired,
  children: PropTypes.array.isRequired,
};

export default withTranslation()(CustomizeFunctionOption);
