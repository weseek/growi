import React, { Fragment } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminExternalAccountsContainer from '~/client/services/AdminExternalAccountsContainer';
import { toastError } from '~/client/util/apiNotification';

import PaginationWrapper from '../PaginationWrapper';
import { withUnstatedContainers } from '../UnstatedUtils';

import ExternalAccountTable from './Users/ExternalAccountTable';


class ManageExternalAccount extends React.Component {

  constructor(props) {
    super(props);
    this.handleExternalAccountPage = this.handleExternalAccountPage.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.handleExternalAccountPage(1);
  }

  async handleExternalAccountPage(selectedPage) {
    try {
      await this.props.adminExternalAccountsContainer.retrieveExternalAccountsByPagingNum(selectedPage);
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminExternalAccountsContainer } = this.props;
    const { activePage, totalAccounts, pagingLimit } = adminExternalAccountsContainer.state;


    const pager = (
      <PaginationWrapper
        activePage={activePage}
        changePage={this.handleExternalAccountPage}
        totalItemsCount={totalAccounts}
        pagingLimit={pagingLimit}
        align="center"
        size="sm"
      />
    );
    return (
      <Fragment>
        <p>
          <a className="btn btn-outline-secondary" href="/admin/users">
            <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
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
              {t('admin:user_management.external_account_none')}
            </>
          )}

      </Fragment>
    );
  }

}

ManageExternalAccount.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminExternalAccountsContainer: PropTypes.instanceOf(AdminExternalAccountsContainer).isRequired,
};

const ManageExternalAccountWrapperFC = (props) => {
  const { t } = useTranslation();
  return <ManageExternalAccount t={t} {...props} />;
};

const ManageExternalAccountWrapper = withUnstatedContainers(ManageExternalAccountWrapperFC, [AdminExternalAccountsContainer]);

export default ManageExternalAccountWrapper;
