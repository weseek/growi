import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Page from '../../PageList/Page';
import PaginationWrapper from '../../PaginationWrapper';
import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUserGroupDetailContainer from '../../../services/AdminUserGroupDetailContainer';
import { toastError } from '../../../util/apiNotification';

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
      const res = await this.props.appContainer.apiv3.get(`/user-groups/${this.props.adminUserGroupDetailContainer.state.userGroup._id}/pages`, {
        limit,
        offset,
      });
      const { total, pages } = res.data;

      this.setState({
        total: total || 0,
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

    return (
      <Fragment>
        <ul className="page-list-ul page-list-ul-flat mb-3">
          {this.state.currentPages.map(page => <li key={page._id}><Page page={page} /></li>)}
        </ul>
        {adminUserGroupDetailContainer.state.relatedPages.length === 0 ? <p>{t('admin:user_group_management.no_pages')}</p> : null}
        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePageChange}
          totalItemsCount={this.state.total}
          pagingLimit={this.state.pagingLimit}
          size="sm"
        />
      </Fragment>
    );
  }

}

UserGroupPageList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUserGroupDetailContainer: PropTypes.instanceOf(AdminUserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupPageListWrapper = withUnstatedContainers(UserGroupPageList, [AppContainer, AdminUserGroupDetailContainer]);

export default withTranslation()(UserGroupPageListWrapper);
