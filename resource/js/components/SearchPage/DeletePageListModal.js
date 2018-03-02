import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'react-bootstrap/es/Button';
import { Modal } from 'react-bootstrap/es/Modal';
import { Checkbox } from 'react-bootstrap/es/Checkbox';

import ReactUtils from '../ReactUtils';

export default class DeletePageListModal extends React.Component {

  /*
   * the threshold for omitting body
   */
  static get OMIT_BODY_THRES() { return 400 };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render() {
    if (this.props.pages === undefined || this.props.pages.length == 0) {
      return <div></div>
    }

    const listView = this.props.pages.map((page) => {
      return (
        <li key={page._id}>{page.path}</li>
      );
    });

    return (
      <Modal show={this.props.isShown} onHide={this.props.cancel} className="page-list-delete-modal">
        <Modal.Header closeButton>
          <Modal.Title>Deleting pages:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            {listView}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <span className="text-danger">{this.props.errorMessage}</span>&nbsp;
          <Checkbox onClick={this.props.toggleDeleteCompletely}>Delete completely</Checkbox>
          <Button onClick={this.props.cancel}>Cancel</Button>
          <Button onClick={this.props.confirmedToDelete} className="btn-danger">Delete</Button>
        </Modal.Footer>
      </Modal>
    );
  }

}

DeletePageListModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  pages: PropTypes.array,
  errorMessage: PropTypes.string,
  cancel: PropTypes.func.isRequired,                 // for cancel evnet handling
  confirmedToDelete: PropTypes.func.isRequired,      // for confirmed event handling
  toggleDeleteCompletely: PropTypes.func.isRequired, // for delete completely check event handling
};
