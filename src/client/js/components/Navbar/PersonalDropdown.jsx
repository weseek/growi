import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import UserPicture from '../User/UserPicture';

const PersonalDropdown = (props) => {

  const { t, appContainer } = props;
  const user = appContainer.currentUser || {};

  const logoutHandler = () => {
    const { interceptorManager } = appContainer;

    const context = {
      user,
      currentPagePath: decodeURIComponent(window.location.pathname),
    };
    interceptorManager.process('logout', context);

    window.location.href = '/logout';
  };

  return (
    <>
      <a className="dropdown-toggle waves-effect waves-light" data-toggle="dropdown">
        <UserPicture user={user} withoutLink />&nbsp;{user.name}
      </a>
      <ul className="dropdown-menu dropdown-menu-right">
        <li><a href={`/user/${user.username}`}><i className="icon-fw icon-home"></i>{ t('Home') }</a></li>
        <li><a href="/me"><i className="icon-fw icon-wrench"></i>{ t('User Settings') }</a></li>
        <li role="separator" className="divider"></li>
        <li><a href={`/user/${user.username}#user-draft-list`}><i className="icon-fw icon-docs"></i>{ t('List Drafts') }</a></li>
        <li><a href="/trash"><i className="icon-fw icon-trash"></i>{ t('Deleted Pages') }</a></li>
        <li role="separator" className="divider"></li>
        <li><a role="button" onClick={logoutHandler}><i className="icon-fw icon-power"></i>{ t('Sign out') }</a></li>
      </ul>
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const PersonalDropdownWrapper = (props) => {
  return createSubscribedElement(PersonalDropdown, props, [AppContainer]);
};


PersonalDropdown.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(PersonalDropdownWrapper);
