
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { toastSuccess, toastError } from '../../util/apiNotification';
import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

import LdapAuthTest from '../Admin/Security/LdapAuthTest';
import MikanAuthTest from '../Admin/Security/MikanAuthTest';

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
    try {
      await personalContainer.retrieveExternalAccounts();
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose} size="lg">
        <ModalHeader className="bg-info text-light" toggle={this.props.onClose}>
          {t('admin:user_management.create_external_account')}
        </ModalHeader>
        <ModalBody>
          <ul className="nav nav-tabs passport-settings mb-2" role="tablist">
            <li className="nav-item">
              <a href="#passport-mikan" className="nav-link active" data-toggle="tab" role="tab">
                <i className="fa fa-paper-plane"></i> LDAP
              </a>
            </li>
            <li className="nav-item active">
              <a href="#passport-ldap" className="nav-link active" data-toggle="tab" role="tab">
                <i className="fa fa-sitemap"></i> LDAP
              </a>
            </li>
            <li className="nav-item">
              <a href="#github-tbd" className="nav-link" data-toggle="tab" role="tab">
                <i className="fa fa-github"></i> (TBD) GitHub
              </a>
            </li>
            <li className="nav-item">
              <a href="#google-tbd" className="nav-link" data-toggle="tab" role="tab">
                <i className="fa fa-google"></i> (TBD) Google OAuth
              </a>
            </li>
            <li className="nav-item">
              <a href="#facebook-tbd" className="nav-link" data-toggle="tab" role="tab">
                <i className="fa fa-facebook"></i> (TBD) Facebook
              </a>
            </li>
            <li className="nav-item">
              <a href="#twitter-tbd" className="nav-link" data-toggle="tab" role="tab">
                <i className="fa fa-twitter"></i> (TBD) Twitter
              </a>
            </li>
          </ul>
          <div className="tab-content">
            <div id="passport-ldap" className="tab-pane active">
              <LdapAuthTest
                username={this.state.username}
                password={this.state.password}
                onChangeUsername={this.onChangeUsername}
                onChangePassword={this.onChangePassword}
              />
            </div>
            <div id="passport-mikan" className="tab-pane active">
              <MikanAuthTest
                username={this.state.username}
                password={this.state.password}
                onChangeUsername={this.onChangeUsername}
                onChangePassword={this.onChangePassword}
              />
            </div>
            <div id="github-tbd" className="tab-pane" role="tabpanel">TBD</div>
            <div id="google-tbd" className="tab-pane" role="tabpanel">TBD</div>
            <div id="facebook-tbd" className="tab-pane" role="tabpanel">TBD</div>
            <div id="twitter-tbd" className="tab-pane" role="tabpanel">TBD</div>
          </div>
        </ModalBody>
        <ModalFooter className="border-top-0">
          <button type="button" className="btn btn-info mt-3" onClick={this.onClickAddBtn}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i>
            {t('add')}
          </button>
        </ModalFooter>
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
