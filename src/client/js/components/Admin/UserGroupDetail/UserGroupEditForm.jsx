import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUserGroupDetailContainer from '../../../services/AdminUserGroupDetailContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupEditForm extends React.Component {

  constructor(props) {
    super(props);

    const { adminUserGroupDetailContainer } = props;
    const { userGroup } = adminUserGroupDetailContainer.state;

    this.state = {
      name: userGroup.name,
      nameCache: userGroup.name, // cache for name. update every submit
    };

    this.xss = window.xss;

    this.changeUserGroupName = this.changeUserGroupName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  changeUserGroupName(event) {
    this.setState({
      name: event.target.value,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await this.props.adminUserGroupDetailContainer.updateUserGroup({
        name: this.state.name,
      });

      toastSuccess(`Updated the group name to "${this.xss.process(res.data.userGroup.name)}"`);
      this.setState({ nameCache: this.state.name });
    }
    catch (err) {
      toastError(new Error('Unable to update the group name'));
    }
  }

  validateForm() {
    return (
      this.state.name !== this.state.nameCache
      && this.state.name !== ''
    );
  }

  render() {
    const { t, adminUserGroupDetailContainer } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <fieldset>
          <h2 className="admin-setting-header">{t('admin:user_group_management.basic_info')}</h2>
          <div className="form-group row">
            <label htmlFor="name" className="col-md-2 col-form-label">
              {t('Name')}
            </label>
            <div className="col-md-4">
              <input className="form-control" type="text" name="name" value={this.state.name} onChange={this.changeUserGroupName} />
            </div>
          </div>
          <div className="form-group row">
            <label className="col-md-2 col-form-label">{t('Created')}</label>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                value={dateFnsFormat(new Date(adminUserGroupDetailContainer.state.userGroup.createdAt), 'yyyy-MM-dd')}
                disabled
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="offset-md-2 col-md-10">
              <button type="submit" className="btn btn-primary" disabled={!this.validateForm()}>
                {t('Update')}
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    );
  }

}

UserGroupEditForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUserGroupDetailContainer: PropTypes.instanceOf(AdminUserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupEditFormWrapper = withUnstatedContainers(UserGroupEditForm, [AppContainer, AdminUserGroupDetailContainer]);

export default withTranslation()(UserGroupEditFormWrapper);
