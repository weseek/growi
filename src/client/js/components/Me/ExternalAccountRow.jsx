
import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

const ExternalAccountRow = (props) => {
  const { t, account } = props;

  return (
    <tr>
      <td>{ account.providerType }</td>
      <td>
        <strong>{ account.accountId }</strong>
      </td>
      <td>{dateFnsFormat(new Date(account.createdAt), 'yyyy-MM-dd')}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={() => props.openDisassociateModal(account)}
        >
          <i className="ti-unlink"></i>
          { t('Disassociate') }
        </button>
      </td>
    </tr>
  );
};


ExternalAccountRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  account: PropTypes.object.isRequired,
  openDisassociateModal: PropTypes.func.isRequired,
};

export default withTranslation()(ExternalAccountRow);
