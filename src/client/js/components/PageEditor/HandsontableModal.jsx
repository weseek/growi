import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';

import { HotTable } from '@handsontable/react';

import MarkdownTable from '../../models/MarkdownTable';

export default class HandsontableModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };

    this.settings = {
      height: 300,
      rowHeaders: true,
      colHeaders: true,
      fixedRowsTop: [0, 1],
      contextMenu: ['row_above', 'row_below', 'col_left', 'col_right', '---------', 'remove_row', 'remove_col', '---------', 'alignment'],
      stretchH: 'all',
      selectionMode: 'multiple',
    };

    this.init = this.init.bind(this);
    this.cancel = this.cancel.bind(this);
    this.save = this.save.bind(this);
  }

  componentWillMount() {
    this.init(this.props.markdownTable);
  }

  init(markdownTable) {
    const initMarkdownTable = markdownTable || new MarkdownTable([
      ['col1', 'col2', 'col3'],
      ['', '', ''],
      ['', '', ''],
    ]);
    this.setState({ markdownTable: initMarkdownTable });
  }

  show(markdownTable, doneHandler) {
    this.init(markdownTable);
    this.setState({ show: true });
  }

  cancel() {
    this.setState({ show: false });
  }

  save() {
    if (this.props.onSave != null) {
      this.props.onSave(this.state.markdownTable);
    }
    this.setState({ show: false });
  }

  render() {
    return (
      <Modal show={this.state.show} onHide={this.cancel} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Edit Table</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-4">
            <HotTable data={this.state.markdownTable.table} settings={this.settings} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between">
            <Button bsStyle="danger" onClick={() => this.init(this.props.markdownTable)}>Reset</Button>
            <div className="d-flex">
              <Button bsStyle="default" onClick={this.cancel}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.save}>Done</Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

HandsontableModal.propTypes = {
  markdownTable: PropTypes.instanceOf(MarkdownTable),
  onSave: PropTypes.func,
};
