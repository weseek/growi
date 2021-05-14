import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const AdminUpdateButtonRow = (props) => {
  const { t } = props;

  return (
    <button type="button" className="btn btn-primary" onClick={props.onClick} disabled={props.disabled}>{ t('Update') }</button>
  );
};

AdminUpdateButtonRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default withTranslation()(AdminUpdateButtonRow);
