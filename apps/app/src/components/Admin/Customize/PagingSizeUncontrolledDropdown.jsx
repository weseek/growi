import React from 'react';

import PropTypes from 'prop-types';
import DropdownItem from 'reactstrap/es/DropdownItem';
import DropdownMenu from 'reactstrap/es/DropdownMenu';
import DropdownToggle from 'reactstrap/es/DropdownToggle';
import UncontrolledDropdown from 'reactstrap/es/UncontrolledDropdown';


const PagingSizeUncontrolledDropdown = (props) => {

  function dropdownItemOnClickHandler(num) {
    if (props.onChangeDropdownItem === null) {
      return;
    }
    props.onChangeDropdownItem(num);
  }

  return (
    <React.Fragment>
      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          <div className="my-0 w-100">
            <label>{props.label}</label>
          </div>
          <UncontrolledDropdown>
            <DropdownToggle className="text-right col-6" caret>
              <span className="float-left">{props.toggleLabel}</span>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu" role="menu">
              {props.dropdownItemSize.map((num) => {
                return (
                  <DropdownItem key={num} role="presentation" onClick={() => dropdownItemOnClickHandler(num)}>
                    <a role="menuitem">{num}</a>
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </UncontrolledDropdown>
          <p className="form-text text-muted">
            {props.desc}
          </p>
        </div>
      </div>
    </React.Fragment>
  );
};


PagingSizeUncontrolledDropdown.propTypes = {
  label: PropTypes.string,
  toggleLabel: PropTypes.number,
  dropdownItemSize: PropTypes.array,
  desc: PropTypes.string,
  onChangeDropdownItem: PropTypes.func,
};

export default PagingSizeUncontrolledDropdown;
