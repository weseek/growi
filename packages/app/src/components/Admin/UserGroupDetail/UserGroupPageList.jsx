import React, { Fragment } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminUserGroupDetailContainer from '~/client/services/AdminUserGroupDetailContainer';
import { toastError } from '~/client/util/apiNotification';
import { apiv3Get } from '~/client/util/apiv3-client';
import { IPageHasId } from '~/interfaces/page';

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
      const res = await apiv3Get(`/user-groups/${this.props.userGroupId}/pages`, {
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
    const { relatedPages } = this.props;

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
  adminUserGroupDetailContainer: PropTypes.instanceOf(AdminUserGroupDetailContainer).isRequired,
  userGroupId: PropTypes.string.isRequired,
  relatedPages: PropTypes.arrayOf(IPageHasId),
};

const UserGroupPageListWrapperFC = (props) => {
  const { t } = useTranslation();
  const { userGroupId, relatedPages } = props;


  if (userGroupId == null || relatedPages == null) {
    return <></>;
  }

  return <UserGroupPageList t={t} userGroupId={userGroupId} relatedPages={relatedPages} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const UserGroupPageListWrapper = withUnstatedContainers(UserGroupPageListWrapperFC, [AdminUserGroupDetailContainer]);

export default UserGroupPageListWrapper;
