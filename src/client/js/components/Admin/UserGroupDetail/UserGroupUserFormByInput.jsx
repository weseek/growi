import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { debounce } from 'throttle-debounce';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import UserPicture from '../../User/UserPicture';

class UserGroupUserFormByInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      input: '',
      applicableUsers: [],
      isLoading: false,
      searchError: null,
    };

    this.xss = window.xss;

    this.onInputChange = this.onInputChange.bind(this);
    this.addUserBySubmit = this.addUserBySubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);

    this.searhApplicableUsersDebounce = debounce(1000, this.searhApplicableUsers);
  }

  /**
   * input user name to add to the group
   * @param {string} input
   */
  onInputChange(input) {
    this.setState({ input });
    if (input === '') {
      this.setState({ applicableUsers: [] });
    }
  }


  async addUserBySubmit(input) {

    try {
      await this.props.userGroupDetailContainer.addUserByUsername(input);
      toastSuccess(`Added "${this.xss.process(input)}" to "${this.xss.process(this.props.userGroupDetailContainer.state.userGroup.name)}"`);
      this.setState({ input: '' });
    }
    catch (err) {
      toastError(new Error(`Unable to add "${this.xss.process(input)}" to "${this.xss.process(this.props.userGroupDetailContainer.state.userGroup.name)}"`));
    }
  }

  validateForm() {
    return this.state.input !== '';
  }

  async searhApplicableUsers() {
    try {
      const users = await this.props.userGroupDetailContainer.fetchApplicableUsers(this.state.input);
      this.setState({ applicableUsers: users, isLoading: false });
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Reflect when forecast is clicked
   * @param {string} input
   */
  handleChange(input) {
    this.setState({ input });
  }

  handleSearch(keyword) {

    if (keyword === '') {
      return;
    }

    this.setState({ isLoading: true });
    this.searhApplicableUsersDebounce();
  }

  onKeyDown(event) {
    const input = event.target.defaultValue;
    // 13 is Enter key
    if (event.keyCode === 13) {
      this.addUserBySubmit(input);
    }
  }

  renderMenuItemChildren(option) {
    const { userGroupDetailContainer } = this.props;
    const user = option;
    return (
      <React.Fragment>
        <UserPicture user={user} size="sm" withoutLink />
        <span className="ml-2">{user.username}</span>
        {userGroupDetailContainer.state.isAlsoNameSearched && <span className="ml-2">{user.name}</span>}
        {userGroupDetailContainer.state.isAlsoMailSearched && <span className="ml-2">{user.email}</span>}
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
            onInputChange={this.onInputChange}
            onKeyDown={this.onKeyDown}
            caseSensitive={false}
          />
        </div>
        <div className="col-xs-2 pl-0">
          <button
            type="button"
            className="btn btn-sm btn-success"
            disabled={!this.validateForm()}
            onClick={event => this.addUserBySubmit(event.target.value)}
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
  userGroupDetailContainer: PropTypes.instanceOf(UserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserFormByInputWrapper = (props) => {
  return createSubscribedElement(UserGroupUserFormByInput, props, [AppContainer, UserGroupDetailContainer]);
};

export default withTranslation()(UserGroupUserFormByInputWrapper);
