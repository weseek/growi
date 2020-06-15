import React from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

export default class GridEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };
  }

  show() {
    this.setState({ show: true });
  }

  hide() {
    this.setState({ show: false });
  }

  cancel() {
    this.hide();
  }

  render() {

    return (
      <Modal isOpen={this.state.show} toggle={this.cancel}>
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Grid
        </ModalHeader>
        <ModalBody>
        </ModalBody>
        <ModalFooter className="grw-modal-footer">
          <div className="ml-auto">
            <button type="button" className="mr-2 btn btn-secondary" onClick={this.cancel}>Cancel</button>
            <button type="button" className="btn btn-primary">Done</button>
          </div>
        </ModalFooter>
      </Modal>
    );
  }

}
