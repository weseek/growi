import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import FormControl from 'react-bootstrap/es/FormControl';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class UserInviteModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    console.log('push submit');
  }

  render() {
    const { t } = this.props;

    return (
      <Modal show={this.props.show} onHide={this.props.onToggleModal}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            { t('user_management.invite_users') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label> { t('user_management.emails') }</label>
          <FormControl
            placeholder="e.g. user@growi.org"
          />
        </Modal.Body>
        <Modal.Footer className="d-flex">
          <label className="mr-3 text-left" style={{ flex: 1 }}>
            {/* TODO Check Boxの値を設定する */}
            <input
              type="checkbox"
              id="comment-form-is-markdown"
              name="isMarkdown"
              checked={this.state.isMarkdown}
              value="1"
              onChange={this.updateStateCheckbox}
            />
            <span className="ml-2">{ t('user_management.invite_thru_email') }</span>
          </label>
          <div>
            <Button bsStyle="danger" className="fcbtn btn btn-xs btn-danger btn-outline btn-rounded" onClick={this.props.onToggleModal}>
              Cancel
            </Button>
            <Button
              bsStyle="primary"
              className="fcbtn btn btn-primary btn-outline btn-rounded btn-1b"
              onClick={this.handleSubmit}
            >
              Done
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserInviteModalWrapper = (props) => {
  return createSubscribedElement(UserInviteModal, props, [AppContainer]);
};


UserInviteModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  show: PropTypes.bool.isRequired,
  onToggleModal: PropTypes.func.isRequired,
};

export default withTranslation()(UserInviteModalWrapper);
