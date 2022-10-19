import React, { useCallback, useEffect } from 'react';

import { useTranslation } from 'next-i18next';

import AdminExternalAccountsContainer from '~/client/services/AdminExternalAccountsContainer';
import { toastError } from '~/client/util/apiNotification';

import PaginationWrapper from '../PaginationWrapper';
import { withUnstatedContainers } from '../UnstatedUtils';

import ExternalAccountTable from './Users/ExternalAccountTable';


type ManageExternalAccountProps = {
  adminExternalAccountsContainer: AdminExternalAccountsContainer,
}

const ManageExternalAccount = (props: ManageExternalAccountProps): JSX.Element => {

  const { t } = useTranslation();
  const { adminExternalAccountsContainer } = props;
  const { activePage, totalAccounts, pagingLimit } = adminExternalAccountsContainer.state;

  const ExternalAccountPageHandler = useCallback(async(selectedPage) => {
    try {
      await adminExternalAccountsContainer.retrieveExternalAccountsByPagingNum(selectedPage);
    }
    catch (err) {
      toastError(err);
    }
  }, [adminExternalAccountsContainer]);

  // componentDidMount
  useEffect(() => {
    ExternalAccountPageHandler(1);
  }, []);

  const pager = (
    <PaginationWrapper
      activePage={activePage}
      changePage={ExternalAccountPageHandler}
      totalItemsCount={totalAccounts}
      pagingLimit={pagingLimit}
      align="center"
      size="sm"
    />
  );

  return (
    <>
      <p>
        <a className="btn btn-outline-secondary" href="/admin/users">
          <i className="icon-fw ti ti-arrow-left" aria-hidden="true"></i>
          {t('admin:user_management.back_to_user_management')}
        </a>
      </p>
      <h2>{t('admin:user_management.external_account_list')}</h2>
      {(totalAccounts !== 0) ? (
        <>
          {pager}
          <ExternalAccountTable />
          {pager}
        </>
      )
        : (
          <>
            { t('admin:user_management.external_account_none') }
          </>
        )
      }
    </>
  );
};

const ManageExternalAccountWrapper = withUnstatedContainers(ManageExternalAccount, [AdminExternalAccountsContainer]);

export default ManageExternalAccountWrapper;
