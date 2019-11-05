import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeFunctionOption extends React.PureComponent {

  render() {
    return (
      <div className="form-group row">
        <div className="col-xs-offset-4 col-xs-6 text-left">
          <div className="checkbox checkbox-success">
            <input
              type="checkbox"
              id={this.props.optionId}
              checked={this.props.isChecked}
              onChange={this.props.onChecked}
            />
            <label htmlFor={this.props.optionId}>
              {this.props.label}
            </label>
          </div>
          {this.props.children}
        </div>
      </div>
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
