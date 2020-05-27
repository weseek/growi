import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import UserGroupEditForm from './UserGroupEditForm';
import UserGroupUserTable from './UserGroupUserTable';
import UserGroupUserModal from './UserGroupUserModal';
import UserGroupPageList from './UserGroupPageList';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserGroupDetailPage extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <div>
        <a href="/admin/user-groups" className="btn btn-outline-secondary">
          <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
          {t('admin:user_group_management.back_to_list')}
        </a>
        <div className="mt-4 form-box">
          <UserGroupEditForm />
        </div>
        <h2 className="admin-setting-header mt-4">{t('admin:user_group_management.user_list')}</h2>
        <UserGroupUserTable />
        <UserGroupUserModal />
        <h2 className="admin-setting-header mt-4">{t('Page')}</h2>
        <div className="page-list">
          <UserGroupPageList />
        </div>
      </div>
    );
  }

}

UserGroupDetailPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupDetailPageWrapper = (props) => {
  return createSubscribedElement(UserGroupDetailPage, props, [AppContainer]);
};

export default withTranslation()(UserGroupDetailPageWrapper);
