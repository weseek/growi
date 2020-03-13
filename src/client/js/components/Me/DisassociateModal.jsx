
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';
import { toastSuccess, toastError } from '../../util/apiNotification';
import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

import LdapAuthTest from '../Admin/Security/LdapAuthTest';

class DisassociateModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onClickAddBtn = this.onClickAddBtn.bind(this);
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

  async onClickAddBtn() {
    const { t, personalContainer } = this.props;
    const { username, password } = this.state;

    try {
      await personalContainer.associateLdapAccount({ username, password });
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header className="bg-info" closeButton>
          <Modal.Title className="text-white">
            {t('Diassociate External Account')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

        </Modal.Body>
        <Modal.Footer>

        </Modal.Footer>
      </Modal>
    );
  }

}

const DisassociateModalWrapper = (props) => {
  return createSubscribedElement(DisassociateModal, props, [AppContainer, PersonalContainer]);
};

DisassociateModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};


export default withTranslation()(DisassociateModalWrapper);
