import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupUserFormByClick extends React.Component {

  constructor(props) {
    super(props);
    this.xss = window.xss;

    this.addUserByClick = this.addUserByClick.bind(this);
  }

  async addUserByClick(username) {
    try {
      await this.props.userGroupDetailContainer.addUserByUsername(username);
      toastSuccess(`Added "${this.xss.process(username)}" to "${this.xss.process(this.props.userGroupDetailContainer.state.userGroup.name)}"`);
    }
    catch (err) {
      toastError(new Error(`Unable to add "${this.xss.process(username)}" to "${this.xss.process(this.props.userGroupDetailContainer.userGroup.name)}"`));
    }
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { t, userGroupDetailContainer } = this.props;

    return (
      <Fragment>
        <ul className="list-inline">
          {userGroupDetailContainer.state.unrelatedUsers.map((user) => {
              return (
                <li key={user._id}>
                  <button type="submit" className="btn btn-xs btn-primary" onClick={() => { return this.addUserByClick(user.username) }}>
                    {user.username}
                  </button>
                </li>
              );
            })}
        </ul>

        {userGroupDetailContainer.state.unrelatedUsers.length === 0 ? 'No users available.' : null}
      </Fragment>
    );
  }

}

UserGroupUserFormByClick.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  userGroupDetailContainer: PropTypes.instanceOf(UserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserFormByClickWrapper = (props) => {
  return createSubscribedElement(UserGroupUserFormByClick, props, [AppContainer, UserGroupDetailContainer]);
};

export default withTranslation()(UserGroupUserFormByClickWrapper);
