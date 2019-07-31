import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class AdminMenuForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

  }

  render() {
    const { t } = this.props;

    return (
      <form className="px-4" action="/admin/user/{{ sUser._id.toString() }}/makeAdmin" method="post">
        <i className="icon-fw icon-magic-wand"></i>{ t('user_management.give_admin_access') }
      </form>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const AdminMenuFormWrapper = (props) => {
  return createSubscribedElement(AdminMenuForm, props, [AppContainer]);
};

AdminMenuForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(AdminMenuFormWrapper);
