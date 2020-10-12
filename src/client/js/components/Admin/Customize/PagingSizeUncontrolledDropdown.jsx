import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';


const PagingSizeUncontrolledDropdown = (props) => {
  const { t, adminCustomizeContainer } = props;

  const dropdownGroupMapping = {
    S:  {
      label: 'admin:customize_setting.function_options.list_num_s',
      pageLimitation: adminCustomizeContainer.state.pageLimitationS,
      switchPageListLimitation: adminCustomizeContainer.switchPageListLimitationS,
      desc: 'admin:customize_setting.function_options.list_num_desc_s',
      dropdownMenu: [10, 20, 50, 100],
    },
    M:  {
      label: 'admin:customize_setting.function_options.list_num_m',
      pageLimitation: adminCustomizeContainer.state.pageLimitationM,
      switchPageListLimitation: adminCustomizeContainer.switchPageListLimitationM,
      desc: 'admin:customize_setting.function_options.list_num_desc_m',
      dropdownMenu: [5, 10, 20, 50, 100],
    },
    L: {
      label: 'admin:customize_setting.function_options.list_num_l',
      pageLimitation: adminCustomizeContainer.state.pageLimitationL,
      switchPageListLimitation: adminCustomizeContainer.switchPageListLimitationL,
      desc: 'admin:customize_setting.function_options.list_num_desc_l',
      dropdownMenu: [20, 50, 100, 200],
    },
    XL: {
      label: 'admin:customize_setting.function_options.list_num_xl',
      pageLimitation: adminCustomizeContainer.state.pageLimitationXL,
      switchPageListLimitation: adminCustomizeContainer.switchPageListLimitationXL,
      desc: 'admin:customize_setting.function_options.list_num_desc_xl',
      dropdownMenu: [5, 10, 20, 50, 100],
    },
  };

  return (
    <React.Fragment>
      {Object.entries(dropdownGroupMapping).map(([key, value]) => {
        return (
          <div className="form-group row" key={key}>
            <div className="offset-md-3 col-md-6 text-left">
              <div className="my-0 w-100">
                <label>{t(value.label)}</label>
              </div>
              <UncontrolledDropdown>
                <DropdownToggle className="text-right col-6" caret>
                  <span className="float-left">{value.pageLimitation}</span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu" role="menu">
                  {props.dropdownItemSize.map((num) => {
                    return (
                      <DropdownItem key={num} role="presentation" onClick={() => { value.switchPageListLimitation(num) }}>
                        <a role="menuitem">{num}</a>
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </UncontrolledDropdown>
              <p className="form-text text-muted">
                {t(value.desc)}
              </p>
            </div>
          </div>
        );
      })}
    </React.Fragment>
  );
};


const PagingSizeUncontrolledDropdownWrapper = withUnstatedContainers(PagingSizeUncontrolledDropdown, [AdminCustomizeContainer]);

PagingSizeUncontrolledDropdown.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
  // toggleLabel: PropTypes.func,
  dropdownItemSize: PropTypes.array,
};

export default withTranslation()(PagingSizeUncontrolledDropdownWrapper);
