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

  render() {

    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="xl">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Grid
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col-2">
                <div className="device-titile-bar">Phone</div>
                <div className="device-container"></div>
                <div className="device-titile-bar">Tablet</div>
                <div className="device-container"></div>
                <div className="device-titile-bar">Desktop</div>
                <div className="device-container"></div>
                <div className="device-titile-bar">Large Desktop</div>
                <div className="device-container"></div>
              </div>
              <div className="row col-10 flex-nowrap overflow-auto">
                <div className="bg-light mx-1 grid-edit-col">1</div>
                <div className="bg-light mx-1 grid-edit-col">2</div>
                <div className="bg-light mx-1 grid-edit-col">3</div>
                <div className="bg-light mx-1 grid-edit-col">4</div>
                <div className="bg-light mx-1 grid-edit-col">5</div>
                <div className="bg-light mx-1 grid-edit-col">6</div>
                <div className="bg-light mx-1 grid-edit-col">7</div>
                <div className="bg-light mx-1 grid-edit-col">8</div>
                <div className="bg-light mx-1 grid-edit-col">9</div>
                <div className="bg-light mx-1 grid-edit-col">10</div>
                <div className="bg-light mx-1 grid-edit-col">11</div>
                <div className="bg-light mx-1 grid-edit-col">12</div>
              </div>
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
