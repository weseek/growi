import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import UserPicture from '../../User/UserPicture';
import PageListMeta from '../../PageList/PageListMeta';
import PaginationWrapper from '../../PaginationWrapper';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastError } from '../../../util/apiNotification';

class UserGroupPageList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentPages: [],
      activePage: 1,
      total: props.relatedPages.length,
      pagingLimit: Infinity,
    };

    this.handlePageChange = this.handlePageChange.bind(this);
    this.renderPageList = this.renderPageList.bind(this);
  }

  async componentDidMount() {
    await this.handlePageChange(this.state.activePage);
  }

  async handlePageChange(pageNum) {
    const limit = this.state.pagingLimit;
    const offset = (pageNum - 1) * limit;

    try {
      const res = await this.props.appContainer.apiv3.get(`/user-groups/${this.props.userGroup._id}/pages`, { limit, offset });

      this.setState({
        currentPages: res.data.pages,
        activePage: pageNum,
      });
    }
    catch (err) {
      toastError(err);
    }
  }

  renderPageList(page) {
    return (
      <li key={page._id}>
        <UserPicture user={page.lastUpdateUser} className="picture img-circle" />
        <a
          href={page.path}
          className="page-list-link"
          data-path={page.path}
        >
          {decodeURIComponent(page.path)}
        </a>
        <PageListMeta page={page} />
      </li>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <legend className="m-t-20">{ t('Page') }</legend>
        <div className="page-list">
          <ul className="page-list-ul page-list-ul-flat">
            {this.state.currentPages.map((page) => { return this.renderPageList(page) })}
          </ul>
          {this.props.relatedPages.length === 0 ? <p>{ t('user_group_management.no_pages') }</p> : null}
        </div>
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
  userGroup: PropTypes.object.isRequired,
  relatedPages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupPageListWrapper = (props) => {
  return createSubscribedElement(UserGroupPageList, props, [AppContainer]);
};

export default withTranslation()(UserGroupPageListWrapper);
