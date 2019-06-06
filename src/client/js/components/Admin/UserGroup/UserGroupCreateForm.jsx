/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { apiErrorHandler, apiSuccessHandler } from '../../../util/apiNotification';

class UserGroupCreateForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
    };

    this.xss = window.xss;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await this.props.appContainer.apiv3.post('/user-groups', {
        name: this.state.name,
      });

      const userGroup = res.data.userGroup;
      const userGroupId = userGroup._id;

      const res2 = await this.props.appContainer.apiv3.get(`/user-groups/${userGroupId}/users`);

      const { users } = res2.data;

      this.props.onCreate(userGroup, users);

      this.setState({ name: '' });

      apiSuccessHandler(`Created a user group "${this.xss.process(userGroup.name)}"`);
    }
    catch (err) {
      apiErrorHandler(err);
    }
  }

  validateForm() {
    return this.state.name !== '';
  }

  render() {
    const { t } = this.props;

    return (
      <div>
        <p>
          {this.props.isAclEnabled
            ? (
              <button type="button" data-toggle="collapse" className="btn btn-default" href="#createGroupForm">
                { t('user_group_management.create_group') }
              </button>
            )
            : (
              t('user_group_management.deny_create_group')
            )
          }
        </p>
        <form onSubmit={this.handleSubmit}>
          <div id="createGroupForm" className="collapse">
            <div className="form-group">
              <label htmlFor="name">{ t('user_group_management.group_name') }</label>
              <textarea
                id="name"
                name="name"
                className="form-control"
                placeholder={t('user_group_management.group_example')}
                value={this.state.name}
                onChange={this.handleChange}
              >
              </textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={!this.validateForm()}>{ t('Create') }</button>
          </div>
        </form>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserGroupCreateFormWrapper = (props) => {
  return createSubscribedElement(UserGroupCreateForm, props, [AppContainer]);
};

UserGroupCreateForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isAclEnabled: PropTypes.bool,
  onCreate: PropTypes.func.isRequired,
};

export default withTranslation()(UserGroupCreateFormWrapper);
