import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupUserFormByInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
    };

    this.xss = window.xss;

    this.changeUsername = this.changeUsername.bind(this);
    this.addUserBySubmit = this.addUserBySubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  changeUsername(e) {
    this.setState({ username: e.target.value });
  }

  async addUserBySubmit(e) {
    e.preventDefault();
    const { username } = this.state;

    try {
      await this.props.userGroupDetailContainer.addUserByUsername(username);
      toastSuccess(`Added "${this.xss.process(username)}" to "${this.xss.process(this.props.userGroupDetailContainer.state.userGroup.name)}"`);
      this.setState({ username: '' });
    }
    catch (err) {
      toastError(new Error(`Unable to add "${this.xss.process(username)}" to "${this.xss.process(this.props.userGroupDetailContainer.state.userGroup.name)}"`));
    }
  }

  validateForm() {
    return this.state.username !== '';
  }

  render() {
    const { t } = this.props;

    return (
      <form className="form-inline" onSubmit={this.addUserBySubmit}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            className="form-control input-sm"
            placeholder={t('username')}
            value={this.state.username}
            onChange={this.changeUsername}
          />
        </div>
        <button type="submit" className="btn btn-sm btn-success" disabled={!this.validateForm()}>{ t('add') }</button>
      </form>
    );
  }

}

UserGroupUserFormByInput.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  userGroupDetailContainer: PropTypes.instanceOf(UserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserFormByInputWrapper = (props) => {
  return createSubscribedElement(UserGroupUserFormByInput, props, [AppContainer, UserGroupDetailContainer]);
};

export default withTranslation()(UserGroupUserFormByInputWrapper);
