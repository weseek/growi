import React from 'react';
import PropTypes from 'prop-types';

import { Button, Modal } from 'react-bootstrap';

import UserPicture from '../User/UserPicture';

export default class DeleteCommentModal extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render() {
    if (this.props.comment === undefined) {
      return <div></div>
    }

    return (
      <Modal show={this.props.isShown} onHide={this.props.cancel}>
        <Modal.Header closeButton>
          <Modal.Title>Delete comment?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>header</h4>
          <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.cancel}>Cancel</Button>
          <Button onClick={this.props.confirmedToDelete} className="btn-danger">Delete</Button>
        </Modal.Footer>
      </Modal>
    );
  }

}

DeleteCommentModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  comment: PropTypes.object,
  cancel: PropTypes.func.isRequired,            // for cancel evnet handling
  confirmedToDelete: PropTypes.func.isRequired, // for confirmed event handling
};
