import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';


import AppContainer from '~/client/services/AppContainer';
import { usePersonalSettings, useSWRxPersonalExternalAccounts } from '~/stores/personal-settings';

import LdapAuthTest from '../Admin/Security/LdapAuthTest';
import { withUnstatedContainers } from '../UnstatedUtils';


class AssociateModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.clickAddBtnHandler = this.clickAddBtnHandler.bind(this);
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

  async clickAddBtnHandler() {
    const {
      onClickAddBtn, onClose,
    } = this.props;
    const { username, password } = this.state;

    onClickAddBtn({ username, password });
    onClose();
  }

  render() {
    const { t } = this.props;

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose} size="lg" data-testid="grw-associate-modal">
        <ModalHeader className="bg-primary text-light" toggle={this.props.onClose}>
          { t('admin:user_management.create_external_account') }
        </ModalHeader>
        <ModalBody>
          <ul className="nav nav-tabs passport-settings mb-2" role="tablist">
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
            <div id="github-tbd" className="tab-pane" role="tabpanel">TBD</div>
            <div id="google-tbd" className="tab-pane" role="tabpanel">TBD</div>
            <div id="facebook-tbd" className="tab-pane" role="tabpanel">TBD</div>
            <div id="twitter-tbd" className="tab-pane" role="tabpanel">TBD</div>
          </div>
        </ModalBody>
        <ModalFooter className="border-top-0">
          <button type="button" className="btn btn-primary mt-3" onClick={this.clickAddBtnHandler}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i>
            {t('add')}
          </button>
        </ModalFooter>
      </Modal>
    );
  }

}

AssociateModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onClickAddBtn: PropTypes.func.isRequired,
};

const AssociateModalWrapperFC = (props) => {
  const { t } = useTranslation();
  const { mutate: mutatePersonalExternalAccounts } = useSWRxPersonalExternalAccounts();
  const { associateLdapAccount } = usePersonalSettings();

  const associateLdapAccountHandler = (account) => {
    associateLdapAccount(account);
    mutatePersonalExternalAccounts();
  };

  return <AssociateModal t={t} onClickAddBtn={associateLdapAccountHandler} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const AssociateModalWrapper = withUnstatedContainers(AssociateModalWrapperFC, [AppContainer]);

export default AssociateModalWrapper;
