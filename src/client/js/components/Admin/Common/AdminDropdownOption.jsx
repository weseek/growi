import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class AdminDropdownOption extends React.PureComponent {

  render() {

    const menuItem = this.props.options.map((option) => {
      return <button key={option} className="dropdown-item" type="button" onClick={() => this.props.onChangeValue(option)}>{option}</button>;
    });

    return (
      <div className="my-0 form-group">
        <label>{this.props.label}</label>
        <div className="dropdown">
          <button className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {this.props.selectedValue}
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
            {menuItem}
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }

}

AdminDropdownOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  selectedValue: PropTypes.oneOfType(PropTypes.string, PropTypes.number).isRequired,
  label: PropTypes.string.isRequired,
  onChangeValue: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  children: PropTypes.object.isRequired,
};

export default withTranslation()(AdminDropdownOption);
