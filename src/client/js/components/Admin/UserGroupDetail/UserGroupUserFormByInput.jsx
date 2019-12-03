import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { debounce } from 'throttle-debounce';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupUserFormByInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      input: '',
      // TDOO GW-665 fetch users
      applicableUsers: ['hoge', 'huga'],
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

    this.searchUserDebounce = debounce(1000, this.searchUser);
  }

  onInputChange(text) {
    this.setState({ input: text });
    // this.props.onInputChange(text);
    if (text === '') {
      this.setState({ applicableUsers: [] });
    }
  }


  async addUserBySubmit(e) {
    e.preventDefault();
    const { input } = this.state;

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

  searchUser() {
    // TODO GW-665 fetch users
    this.setState({ isLoading: false });
  }

  /**
   * input user name to add to the group
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
    this.searchUserDebounce();
  }

  onKeyDown(event) {
    // 13 is Enter key
    if (event.keyCode === 13) {
      this.addUserBySubmit();
    }
  }

  getEmptyLabel() {
    return (this.state.searchError !== null) && 'Error on searching.';
  }

  renderMenuItemChildren(option, props, index) {
    const user = option;
    return (
      <span>
        {user}
      </span>
    );
  }

  render() {
    const { t } = this.props;

    const inputProps = { autoComplete: 'off' };

    return (
      <form className="form-inline" onSubmit={this.addUserBySubmit}>
        <div className="form-group">
          <AsyncTypeahead
            {...this.props}
            id="name-typeahead-asynctypeahead"
            ref={(c) => { this.typeahead = c }}
            inputProps={inputProps}
            isLoading={this.state.isLoading}
            labelKey="name"
            minLength={0}
            options={this.state.applicableUsers} // Search result (Some page names)
            emptyLabel={this.getEmptyLabel()}
            searchText={(this.state.isLoading ? 'Searching...' : this.getEmptyLabel())}
            align="left"
            onChange={this.handleChange}
            onSearch={this.handleSearch}
            onInputChange={this.onInputChange}
            onKeyDown={this.onKeyDown}
            renderMenuItemChildren={this.renderMenuItemChildren}
            caseSensitive={false}
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
