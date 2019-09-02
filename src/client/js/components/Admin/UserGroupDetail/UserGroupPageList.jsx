import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import UserPicture from '../../User/UserPicture';
import PageListMeta from '../../PageList/PageListMeta';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserGroupPageList extends React.Component {

  constructor(props) {
    super(props);

    this.renderPageList = this.renderPageList.bind(this);
  }

  renderPageList(page) {
    return (
      <li>
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
            {this.props.relatedPages.map((page) => { return this.renderPageList(page) })}
          </ul>
          {this.props.relatedPages.length === 0 ? <p>{ t('user_group_management.no_pages') }</p> : null}
        </div>
      </Fragment>
    );
  }

}

UserGroupPageList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  relatedPages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupPageListWrapper = (props) => {
  return createSubscribedElement(UserGroupPageList, props, [AppContainer]);
};

export default withTranslation()(UserGroupPageListWrapper);
