import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

// import AdminUsersContainer from '../../../services/AdminUsersContainer';
// import UserTable from './UserTable';

const SortIcons = (props) => {

  const { isSelected, isAsc } = props;

  return (
    <div className="d-flex flex-column text-center">
      <a
        className={`fa ${isSelected && isAsc ? 'fa-chevron-up' : 'fa-angle-up'}`}
        aria-hidden="true"
        onClick={() => props.onClick('asc')}
      />
      <a
        className={`fa ${isSelected && !isAsc ? 'fa-chevron-down' : 'fa-angle-down'}`}
        aria-hidden="true"
        onClick={() => props.onClick('desc')}
      />
    </div>
  );
};

SortIcons.propTypes = {
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isAsc: PropTypes.bool.isRequired,
};


export default withTranslation()(SortIcons);
