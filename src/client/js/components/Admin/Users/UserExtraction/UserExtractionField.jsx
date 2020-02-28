import React from 'react';

import UserExtractionTextForm from './UserExtractionTextForm';
import UserExtractionStatusSelect from './UserExtractionStatusSelect';

const statusTypes = [
  'All',
  'Approval Pending',
  'Active',
  'Suspended',
  'Invited',
];
const statusLabels = {
  All: null, ApprovalPending: 'info', Active: 'success', Suspended: 'warning', Invited: 'info',
};

class UserExtractionField extends React.Component {

  render() {
    return (
      <form className="form-inline" style={{ display: 'flex', flexFlow: 'row wrap', alignItems: 'center' }}>
        <UserExtractionTextForm />
        <UserExtractionStatusSelect statusTypes={statusTypes} statusLabels={statusLabels} />
      </form>
    );
  }

}

export default UserExtractionField;
