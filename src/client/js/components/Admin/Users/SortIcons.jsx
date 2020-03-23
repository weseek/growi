import React from 'react';
// import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
// import AdminUsersContainer from '../../../services/AdminUsersContainer';
// import UserTable from './UserTable';

const SortIcons = (props) => {
  const { isSelected } = props;

  return (
    <a
      className={`fa ${props.isSelected ? 'fa-chevron-down' : 'fa-chevron-up'}`}
      aria-hidden="true"
      // onClick={props.onClick}
    />

  );
};

SortIcons.propTypes = {
  // t: PropTypes.func.isRequired, // i18next

  // checked: PropTypes.bool.isRequired,
  // onChange: PropTypes.func.isRequired,
  // event: PropTypes.string.isRequired,
  // children: PropTypes.object.isRequired,
};


export default withTranslation()(SortIcons);
