import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const AdminUpdateButtonRow = (props) => {
  const { t } = props;

  return (
    <div className="row my-3">
      <div className="mx-auto">
        <button type="button" className="btn btn-primary" onClick={props.onClick} disabled={props.disabled}>{ t('Update') }</button>
      </div>
    </div>
  );
};

AdminUpdateButtonRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default withTranslation()(AdminUpdateButtonRow);
