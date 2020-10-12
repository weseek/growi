import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';


const PagingSizeUncontrolledDropdown = (props) => {
  // const { t, adminCustomizeContainer } = props;

  return (
    <div>

    </div>
  );
};

const PagingSizeUncontrolledDropdownWrapper = withUnstatedContainers(PagingSizeUncontrolledDropdown, [AdminCustomizeContainer]);

PagingSizeUncontrolledDropdown.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(PagingSizeUncontrolledDropdownWrapper);
