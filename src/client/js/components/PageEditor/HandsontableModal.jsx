import React from 'react';

import Modal from 'react-bootstrap/es/Modal';

import { HotTable } from '@handsontable/react';

export default class HandsontableModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };

    this.data = [
      ['', 'Ford', 'Volvo', 'Toyota', 'Honda'],
      ['2016', 10, 11, 12, 13],
      ['2017', 20, 11, 14, 13],
      ['2018', 30, 15, 12, 13]
    ];

    this.cancel = this.cancel.bind(this);
  }

  show(data, doneHandler) {
    this.setState({ show: true });
  }

  cancel() {
    this.setState({ show: false });
  }

  render() {
    return (
      <Modal show={this.state.show} onHide={this.cancel}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <HotTable data={this.data} colHeaders={true} rowHeaders={true} width="600" height="300" stretchH="all" />
        </Modal.Body>
      </Modal>
    );
  }
}
