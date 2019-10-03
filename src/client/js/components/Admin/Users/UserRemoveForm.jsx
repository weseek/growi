import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../../util/apiNotification';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserRemoveForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

    this.onClickDeleteBtn = this.onClickDeleteBtn.bind(this);
  }

  async onClickDeleteBtn() {
    const { appContainer, user } = this.props;

    try {
      const response = await appContainer.apiv3.delete(`/users/${user._id}/remove`);
      const { username } = response.data.userData;
      toastSuccess(`Delete ${username} success`);
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <a className="px-4" onClick={this.onClickDeleteBtn}>
        <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
      </a>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserRemoveFormWrapper = (props) => {
  return createSubscribedElement(UserRemoveForm, props, [AppContainer]);
};

UserRemoveForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(UserRemoveFormWrapper);
