import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';


const PagingSizeUncontrolledDropdown = (props) => {
  const { t } = props;

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
            <label>{t(props.label)}</label>
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
            {t(props.desc)}
          </p>
        </div>
      </div>
    </React.Fragment>
  );
};


const PagingSizeUncontrolledDropdownWrapper = withUnstatedContainers(PagingSizeUncontrolledDropdown, [AdminCustomizeContainer]);

PagingSizeUncontrolledDropdown.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
  label: PropTypes.string,
  toggleLabel: PropTypes.number,
  dropdownItemSize: PropTypes.array,
  desc: PropTypes.string,
  onChangeDropdownItem: PropTypes.func,
};

export default withTranslation()(PagingSizeUncontrolledDropdownWrapper);
