import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';

import { HotTable } from '@handsontable/react';

export default class HandsontableModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };

    this.settings = {
      data: this.data,
      height: 300,
      rowHeaders: true,
      colHeaders: true,
      fixedRowsTop: [0, 1],
      contextMenu: ['row_above', 'row_below', 'col_left', 'col_right', '---------', 'remove_row', 'remove_col', '---------', 'alignment'],
      stretchH: 'all',
      selectionMode: 'multiple',
    };

    this.initData(this.props.data);

    this.cancel = this.cancel.bind(this);
  }

  initData(data) {
    const initData = data || [
      ['col1', 'col2', 'col3'],
      ['', '', ''],
      ['', '', ''],
    ];
    this.setState({ data: initData });
  }

  show(data, doneHandler) {
    this.initData(data);
    this.setState({ show: true });
  }

  cancel() {
    this.setState({ show: false });
  }

  render() {
    return (
      <Modal show={this.state.show} onHide={this.cancel} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Edit Table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <HotTable data={this.state.data} settings={this.settings} />
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between">
            <Button bsStyle="danger" onClick={() => this.initData(this.props.data)}>Reset</Button>
            <div className="d-flex">
              <Button bsStyle="default" onClick={this.cancel}>Cancel</Button>
              <Button bsStyle="primary">Done</Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

HandsontableModal.propTypes = {
  data: PropTypes.object,
};
