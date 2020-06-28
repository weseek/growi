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

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
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

  showBgCols() {
    const cols = [];
    for (let i = 0; i < 12; i++) {
      cols.push(<div className="bg-light grid-bg-col col-1"></div>);
    }
    return cols;
  }

  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="xl">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Grid
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col-3">
                <h5>Phone</h5>
                <div className="device-container"></div>
                <h5>Tablet</h5>
                <div className="device-container"></div>
                <h5>Desktop</h5>
                <div className="device-container"></div>
                <h5>Large Desktop</h5>
                <div className="device-container"></div>
              </div>
              <div className="row col-9 flex-nowrap overflow-auto">{this.showBgCols()}</div>
            </div>
          </div>
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
