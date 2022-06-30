import React, { Fragment } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import AdminUserGroupDetailContainer from '~/client/services/AdminUserGroupDetailContainer';
import AppContainer from '~/client/services/AppContainer';
import { toastError } from '~/client/util/apiNotification';
import { apiv3Get } from '~/client/util/apiv3-client';

import PageListItemS from '../../PageList/PageListItemS';
import PaginationWrapper from '../../PaginationWrapper';
import { withUnstatedContainers } from '../../UnstatedUtils';

class UserGroupPageList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentPages: [],
      activePage: 1,
      total: 0,
      pagingLimit: 10,
    };

    this.handlePageChange = this.handlePageChange.bind(this);
  }

  async componentDidMount() {
    await this.handlePageChange(this.state.activePage);
  }

  async handlePageChange(pageNum) {
    const limit = this.state.pagingLimit;
    const offset = (pageNum - 1) * limit;

    try {
      const res = await apiv3Get(`/user-groups/${this.props.adminUserGroupDetailContainer.state.userGroup._id}/pages`, {
        limit,
        offset,
      });
      const { total, pages } = res.data;

      this.setState({
        total,
        activePage: pageNum,
        currentPages: pages,
      });
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminUserGroupDetailContainer } = this.props;
    const { relatedPages } = adminUserGroupDetailContainer.state;

    return (
      <Fragment>
        <ul className="page-list-ul page-list-ul-flat mb-3">
          {this.state.currentPages.map(page => <li key={page._id}><PageListItemS page={page} /></li>)}
        </ul>
        {relatedPages.length === 0 ? <p>{t('admin:user_group_management.no_pages')}</p> : (
          <PaginationWrapper
            activePage={this.state.activePage}
            changePage={this.handlePageChange}
            totalItemsCount={this.state.total}
            pagingLimit={this.state.pagingLimit}
            align="center"
            size="sm"
          />
        )}
      </Fragment>
    );
  }

}

UserGroupPageList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUserGroupDetailContainer: PropTypes.instanceOf(AdminUserGroupDetailContainer).isRequired,
};

const UserGroupPageListWrapperFC = (props) => {
  const { t } = useTranslation();
  return <UserGroupPageList t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const UserGroupPageListWrapper = withUnstatedContainers(UserGroupPageListWrapperFC, [AppContainer, AdminUserGroupDetailContainer]);

export default UserGroupPageListWrapper;
