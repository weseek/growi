import React, { useCallback } from 'react';

import { IAdminExternalAccount } from '@growi/core';
import dateFnsFormat from 'date-fns/format';
import { useTranslation } from 'next-i18next';

import AdminExternalAccountsContainer from '~/client/services/AdminExternalAccountsContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';


type ExternalAccountTableProps = {
  adminExternalAccountsContainer: any,
}

const ExternalAccountTable = (props: ExternalAccountTableProps): JSX.Element => {

  const { t } = useTranslation();

  const { adminExternalAccountsContainer } = props;

  const removeExtenalAccount = useCallback(async(externalAccountId) => {
    try {
      const accountId = await adminExternalAccountsContainer.removeExternalAccountById(externalAccountId);
      toastSuccess(t('admin:toaster.remove_external_user_success', { accountId }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminExternalAccountsContainer, t]);

  return (
    <>
      <table className="table table-bordered table-user-list">
        <thead>
          <tr>
            <th style={{ width: '10rem' }}>{ t('admin:user_management.authentication_provider') }</th>
            <th><code>accountId</code></th>
            <th>{ t('admin:user_management.related_username') }<code>username</code></th>
            <th>
              { t('admin:user_management.password_setting') }
              {/* TODO: Enable popper */}
              <span
                role="button"
                className="text-muted px-2"
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                data-html="true"
                title={t('admin:user_management.password_setting_help')}
              >
                <small><i className="icon-question" aria-hidden="true"></i></small>
              </span>
            </th>
            <th style={{ width: '8rem' }}>{ t('admin:Created') }</th>
            <th style={{ width: '3rem' }}></th>
          </tr>
        </thead>
        <tbody>
          { adminExternalAccountsContainer.state.externalAccounts.map((ea: IAdminExternalAccount) => {
            return (
              <tr key={ea._id}>
                <td style={{ verticalAlign: 'middle' }}>
                  <span>{ea.providerType}</span>
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <strong>{ea.accountId}</strong>
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <strong>{ea.user.username}</strong>
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  {ea.user.password
                    ? (<span className="badge badge-info">{ t('admin:user_management.set') }</span>)
                    : (<span className="badge badge-warning">{ t('admin:user_management.unset') }</span>)
                  }
                </td>
                <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                  <span>{dateFnsFormat(new Date(ea.createdAt), 'yyyy-MM-dd')}</span>
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <div className="btn-group admin-user-menu">
                    <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle" data-toggle="dropdown">
                      <i className="icon-settings"></i> <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu" role="menu">
                      <li className="dropdown-header">{ t('admin:user_management.user_table.edit_menu') }</li>
                      <button
                        className="dropdown-item"
                        type="button"
                        role="button"
                        onClick={() => removeExtenalAccount(ea._id)}
                      >
                        <i className="icon-fw icon-fire text-danger"></i> { t('admin:Delete') }
                      </button>
                    </ul>
                  </div>
                </td>
              </tr>
            );
          }) }
        </tbody>
      </table>
    </>
  );
};

const ExternalAccountTableWrapper = withUnstatedContainers(ExternalAccountTable, [AdminExternalAccountsContainer]);

export default ExternalAccountTableWrapper;
