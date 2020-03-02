
import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

class ExternalAccountRow extends React.PureComponent {

  render() {
    const { t, account } = this.props;

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
            className="btn btn-default btn-sm btn-danger"
          >
            <i className="ti-unlink"></i>
            { t('Diassociate') }
          </button>
        </td>
      </tr>
    );
  }

}

ExternalAccountRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  account: PropTypes.object.isRequired,
};

export default withTranslation()(ExternalAccountRow);
