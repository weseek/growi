import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Page from '../../PageList/Page';
import PaginationWrapper from '../../PaginationWrapper';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';
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
      const res = await this.props.appContainer.apiv3.get(`/user-groups/${this.props.userGroupDetailContainer.state.userGroup._id}/pages`, {
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
    const { t, userGroupDetailContainer } = this.props;

    return (
      <Fragment>
        <ul className="page-list-ul page-list-ul-flat">
          {this.state.currentPages.map((page) => { return <Page key={page._id} page={page} /> })}
        </ul>
        {userGroupDetailContainer.state.relatedPages.length === 0 ? <p>{ t('user_group_management.no_pages') }</p> : null}
        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePageChange}
          totalItemsCount={this.state.total}
          pagingLimit={this.state.pagingLimit}
        />
      </Fragment>
    );
  }

}

UserGroupPageList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  userGroupDetailContainer: PropTypes.instanceOf(UserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupPageListWrapper = (props) => {
  return createSubscribedElement(UserGroupPageList, props, [AppContainer, UserGroupDetailContainer]);
};

export default withTranslation()(UserGroupPageListWrapper);
