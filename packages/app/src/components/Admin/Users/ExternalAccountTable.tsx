import React, { useCallback } from 'react';

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
      toastSuccess(t('toaster.remove_external_user_success', { accountId }));
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
            <th style={{ width: '120px' }}>{ t('admin:user_management.authentication_provider') }</th>
            <th><code>accountId</code></th>
            <th>{ t('admin:user_management.related_username') }<code>username</code></th>
            <th>
              { t('admin:user_management.password_setting') }
              <div
                className="text-muted"
                data-toggle="popover"
                data-placement="top"
                data-trigger="hover focus"
                tabIndex={0}
                role="button"
                data-animation="false"
                data-html="true"
                data-content={t('admin:user_management.password_setting_help')}
              >
                <small>
                  <i className="icon-question" aria-hidden="true"></i>
                </small>
              </div>
            </th>
            <th style={{ width: '100px' }}>{ t('Created') }</th>
            <th style={{ width: '70px' }}></th>
          </tr>
        </thead>
        <tbody>
          { adminExternalAccountsContainer.state.externalAccounts.map((ea) => {

            return (
              <tr key={ea._id}>
                <td>{ea.providerType}</td>
                <td>
                  <strong>{ea.accountId}</strong>
                </td>
                <td>
                  <strong>{ea.user.username}</strong>
                </td>
                <td>
                  {ea.user.password
                    ? (
                      <span className="badge badge-info">{ t('admin:user_management.set') }</span>
                    )
                    : (
                      <span className="badge badge-warning">{ t('admin:user_management.unset') }</span>
                    )
                  }
                </td>
                <td>{dateFnsFormat(new Date(ea.createdAt), 'yyyy-MM-dd')}</td>
                <td>
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
                        onClick={() => { return removeExtenalAccount(ea._id) }}
                      >
                        <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
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

const ExternalAccountTableWrapperFC = (props: any) => {
  return <ExternalAccountTable {...props} />;
};

const ExternalAccountTableWrapper = withUnstatedContainers(ExternalAccountTableWrapperFC, [AdminExternalAccountsContainer]);

export default ExternalAccountTableWrapper;
