import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserRemoveButton extends React.Component {

  constructor(props) {
    super(props);

    this.onClickDeleteBtn = this.onClickDeleteBtn.bind(this);
  }

  onClickDeleteBtn() {
    this.props.removeUser();
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
const UserRemoveButtonWrapper = (props) => {
  return createSubscribedElement(UserRemoveButton, props, [AppContainer]);
};

UserRemoveButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
  removeUser: PropTypes.func.isRequired,
};

export default withTranslation()(UserRemoveButtonWrapper);
