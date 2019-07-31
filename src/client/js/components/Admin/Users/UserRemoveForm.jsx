import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserRemoveForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

  }

  render() {
    const { t } = this.props;

    return (
      <form className="px-4" id="form_remove_{{ sUserId }}" action="/admin/user/{{ sUserId }}/remove" method="post">
        <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
      </form>
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
