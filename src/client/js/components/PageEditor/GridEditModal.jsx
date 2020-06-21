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
      <Modal isOpen={this.state.show} toggle={this.cancel} size="lg">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Grid
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col-2">
                <div style={{ height: 100 }}>Phone</div>
                <div style={{ height: 100 }}>Tablet</div>
                <div style={{ height: 100 }}>Desktop</div>
                <div style={{ height: 100 }}>Large Desktop</div>
              </div>
              <div className="row col-10 flex-nowrap overflow-auto">
                <div className="col-1 bg-light mx-1">1</div>
                <div className="col-1 bg-light mx-1">2</div>
                <div className="col-1 bg-light mx-1">3</div>
                <div className="col-1 bg-light mx-1">4</div>
                <div className="col-1 bg-light mx-1">5</div>
                <div className="col-1 bg-light mx-1">6</div>
                <div className="col-1 bg-light mx-1">7</div>
                <div className="col-1 bg-light mx-1">8</div>
                <div className="col-1 bg-light mx-1">9</div>
                <div className="col-1 bg-light mx-1">10</div>
                <div className="col-1 bg-light mx-1">11</div>
                <div className="col-1 bg-light mx-1">12</div>
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
