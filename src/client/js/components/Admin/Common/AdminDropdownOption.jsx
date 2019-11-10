import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class AdminDropdownOption extends React.PureComponent {

  render() {

    const menuItem = this.props.options.map((option) => {
      return (
        <li key={option} role="presentation" type="button" onClick={() => this.props.onChangeValue(option)}>
          <a role="menuitem" tabIndex="-1">{option}</a>
        </li>
      );
    });

    return (
      <div className="my-0 btn-group">
        <label>{this.props.label}</label>
        <div className="dropdown">
          <button className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {this.props.selectedValue}
            <span className="ml-2 caret"></span>
          </button>
          {/* TODO adjust dropdown after BS4 */}
          <ul className="dropdown-menu" role="menu">
            {menuItem}
          </ul>
        </div>
        {this.props.children}
      </div>
    );
  }

}

AdminDropdownOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  selectedValue: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  onChangeValue: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  children: PropTypes.object.isRequired,
};

export default withTranslation()(AdminDropdownOption);
