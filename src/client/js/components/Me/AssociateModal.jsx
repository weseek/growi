
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';
import { toastSuccess, toastError } from '../../util/apiNotification';
import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

import LdapAuthTest from '../Admin/Security/LdapAuthTest';

class AssociateModal extends React.Component {

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
      this.props.onClose();
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
            { t('Create External Account') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="nav nav-tabs passport-settings mb-2" role="tablist">
            <li className="active">
              <a href="#passport-ldap" data-toggle="tab" role="tab"><i className="fa fa-sitemap"></i> LDAP</a>
            </li>
            <li className="tbd disabled"><a><i className="fa fa-github"></i> (TBD) GitHub</a></li>
            <li className="tbd disabled"><a><i className="fa fa-google"></i> (TBD) Google OAuth</a></li>
            <li className="tbd disabled"><a><i className="fa fa-facebook"></i> (TBD) Facebook</a></li>
            <li className="tbd disabled"><a><i className="fa fa-twitter"></i> (TBD) Twitter</a></li>
          </ul>
          <LdapAuthTest
            username={this.state.username}
            password={this.state.password}
            onChangeUsername={this.onChangeUsername}
            onChangePassword={this.onChangePassword}
          />
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-info mt-3" onClick={this.onClickAddBtn}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i>
            {t('add')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

}

const AssociateModalWrapper = (props) => {
  return createSubscribedElement(AssociateModal, props, [AppContainer, PersonalContainer]);
};

AssociateModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};


export default withTranslation()(AssociateModalWrapper);
