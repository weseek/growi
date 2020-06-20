import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminMikanSecurityContainer from '../../../services/AdminMikanSecurityContainer';
import MikanAuthTest from './MikanAuthTest';

class MikanAuthTestModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
  }

  /**
   * Change username
   */
  onChangeUsername(username) {
    this.setState({ username });
  }

  /**
   * Change password
   */
  onChangePassword(password) {
    this.setState({ password });
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose}>
        <ModalHeader tag="h4" toggle={this.props.onClose} className="bg-info text-light">
          Test Mikan Account
        </ModalHeader>
        <ModalBody>
          <MikanAuthTest
            username={this.state.username}
            password={this.state.password}
            onChangeUsername={this.onChangeUsername}
            onChangePassword={this.onChangePassword}
          />
        </ModalBody>
      </Modal>
    );
  }

}

MikanAuthTestModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMikanSecurityContainer: PropTypes.instanceOf(AdminMikanSecurityContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const MikanAuthTestModalWrapper = withUnstatedContainers(MikanAuthTestModal, [AppContainer, AdminMikanSecurityContainer]);

export default withTranslation()(MikanAuthTestModalWrapper);
