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

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // これは将来的にapiにするので。あとボタンにするとデザインがよくなかったので。
  handleSubmit(event) {
    $(event.currentTarget).parent().submit();
  }

  render() {
    const { t, appContainer, user } = this.props;

    return (
      <a className="px-4">
        <form action={`/admin/user/${user._id}/remove`} method="post">
          <input type="hidden" name="_csrf" value={appContainer.csrfToken} />
          <span onClick={this.handleSubmit}>
            <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
          </span>
        </form>
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
