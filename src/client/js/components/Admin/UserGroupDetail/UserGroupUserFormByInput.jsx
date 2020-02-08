import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { debounce } from 'throttle-debounce';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUserGroupDetailContainer from '../../../services/AdminUserGroupDetailContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import UserPicture from '../../User/UserPicture';

class UserGroupUserFormByInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
      inputUser: '',
      applicableUsers: [],
      isLoading: false,
      searchError: null,
    };

    this.xss = window.xss;

    this.addUserBySubmit = this.addUserBySubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);

    this.searhApplicableUsersDebounce = debounce(1000, this.searhApplicableUsers);
  }

  async addUserBySubmit() {
    const { adminUserGroupDetailContainer } = this.props;
    const { userGroup } = adminUserGroupDetailContainer.state;

    if (this.state.inputUser.length === 0) { return }
    const userName = this.state.inputUser[0].username;

    try {
      await adminUserGroupDetailContainer.addUserByUsername(userName);
      toastSuccess(`Added "${this.xss.process(userName)}" to "${this.xss.process(userGroup.name)}"`);
      this.setState({ inputUser: '' });
    }
    catch (err) {
      toastError(new Error(`Unable to add "${this.xss.process(userName)}" to "${this.xss.process(userGroup.name)}"`));
    }
  }

  validateForm() {
    return this.state.inputUser !== '';
  }

  async searhApplicableUsers() {
    const { adminUserGroupDetailContainer } = this.props;

    try {
      const users = await adminUserGroupDetailContainer.fetchApplicableUsers(this.state.keyword);
      this.setState({ applicableUsers: users, isLoading: false });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Reflect when forecast is clicked
   * @param {object} inputUser
   */
  handleChange(inputUser) {
    this.setState({ inputUser });
  }

  handleSearch(keyword) {

    if (keyword === '') {
      return;
    }

    this.setState({ keyword, isLoading: true });
    this.searhApplicableUsersDebounce();
  }

  onKeyDown(event) {
    // 13 is Enter key
    if (event.keyCode === 13) {
      this.addUserBySubmit();
    }
  }

  renderMenuItemChildren(option) {
    const { adminUserGroupDetailContainer } = this.props;
    const user = option;
    return (
      <React.Fragment>
        <UserPicture user={user} size="sm" withoutLink />
        <strong className="ml-2">{user.username}</strong>
        {adminUserGroupDetailContainer.state.isAlsoNameSearched && <span className="ml-2">{user.name}</span>}
        {adminUserGroupDetailContainer.state.isAlsoMailSearched && <span className="ml-2">{user.email}</span>}
      </React.Fragment>
    );
  }

  getEmptyLabel() {
    return (this.state.searchError !== null) && 'Error on searching.';
  }

  render() {
    const { t } = this.props;

    const inputProps = { autoComplete: 'off' };

    return (
      <div className="row">
        <div className="col-xs-8 pr-0">
          <AsyncTypeahead
            {...this.props}
            id="name-typeahead-asynctypeahead"
            ref={(c) => { this.typeahead = c }}
            inputProps={inputProps}
            isLoading={this.state.isLoading}
            labelKey={user => `${user.username} ${user.name} ${user.email}`}
            minLength={0}
            options={this.state.applicableUsers} // Search result
            searchText={(this.state.isLoading ? 'Searching...' : this.getEmptyLabel())}
            renderMenuItemChildren={this.renderMenuItemChildren}
            align="left"
            onChange={this.handleChange}
            onSearch={this.handleSearch}
            onKeyDown={this.onKeyDown}
            caseSensitive={false}
            clearButton
          />
        </div>
        <div className="col-xs-2 pl-0">
          <button
            type="button"
            className="btn btn-sm btn-success"
            disabled={!this.validateForm()}
            onClick={this.addUserBySubmit}
          >
            {t('add')}
          </button>
        </div>
      </div>
    );
  }

}

UserGroupUserFormByInput.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUserGroupDetailContainer: PropTypes.instanceOf(AdminUserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserFormByInputWrapper = (props) => {
  return createSubscribedElement(UserGroupUserFormByInput, props, [AppContainer, AdminUserGroupDetailContainer]);
};

export default withTranslation()(UserGroupUserFormByInputWrapper);
