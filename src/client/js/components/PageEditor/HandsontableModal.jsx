import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';
import Navbar from 'react-bootstrap/es/Navbar';
import ButtonGroup from 'react-bootstrap/es/ButtonGroup';

import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';

import MarkdownTable from '../../models/MarkdownTable';

export default class HandsontableModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      markdownTableOnInit: HandsontableModal.getDefaultMarkdownTable(),
      markdownTable: HandsontableModal.getDefaultMarkdownTable()
    };

    this.settings = {
      height: 300,
      rowHeaders: true,
      colHeaders: true,
      contextMenu: {
        items: {
          'row_above': {}, 'row_below': {}, 'col_left': {}, 'col_right': {},
          'separator1': Handsontable.plugins.ContextMenu.SEPARATOR,
          'remove_row': {}, 'remove_col': {},
          'separator2': Handsontable.plugins.ContextMenu.SEPARATOR,
          'custom_alignment': {
            name: 'Align columns',
            key: 'align_columns',
            submenu: {
              items: [{
                name: 'Left',
                key: 'align_columns:1',
                callback: function(key, selection) {
                  HandsontableModal.alignColumns(this, selection, 'htLeft');
                }}, {
                name: 'Center',
                key: 'align_columns:2',
                callback: function(key, selection) {
                  HandsontableModal.alignColumns(this, selection, 'htCenter');
                }}, {
                name: 'Right',
                key: 'align_columns:3',
                callback: function(key, selection) {
                  HandsontableModal.alignColumns(this, selection, 'htRight');
                }}
              ]
            }
          }
        }
      },
      stretchH: 'all',
      selectionMode: 'multiple',
    };

    this.init = this.init.bind(this);
    this.reset = this.reset.bind(this);
    this.cancel = this.cancel.bind(this);
    this.save = this.save.bind(this);
  }

  init(markdownTable) {
    const initMarkdownTable = markdownTable || HandsontableModal.getDefaultMarkdownTable();
    this.setState({ markdownTableOnInit: initMarkdownTable });
    this.setState({ markdownTable: initMarkdownTable.clone() });
  }

  show(markdownTable) {
    this.init(markdownTable);
    this.setState({ show: true });
  }

  reset() {
    this.setState({ markdownTable: this.state.markdownTableOnInit.clone() });
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
          <Navbar>
            <Navbar.Form>
              <ButtonGroup>
                <Button><i className="ti-align-left"></i></Button>
                <Button><i className="ti-align-center"></i></Button>
                <Button><i className="ti-align-right"></i></Button>
              </ButtonGroup>
            </Navbar.Form>
          </Navbar>
          <div className="p-4">
            <HotTable data={this.state.markdownTable.table} settings={this.settings} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between">
            <Button bsStyle="danger" onClick={this.reset}>Reset</Button>
            <div className="d-flex">
              <Button bsStyle="default" onClick={this.cancel}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.save}>Done</Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }

  static getDefaultMarkdownTable() {
    return new MarkdownTable([
      ['col1', 'col2', 'col3'],
      ['', '', ''],
      ['', '', ''],
    ]);
  }

  static alignColumns(core, selection, className) {
    const startCol = selection[0].start.col;
    const endCol = selection[0].end.col;
    for (let i = startCol; i <= endCol; i++) {
      for (let j = 0; j < core.countRows(); j++) {
        core.setCellMeta(j, i, 'className', className);
      }
    }
    core.render();
  }
}

HandsontableModal.propTypes = {
  onSave: PropTypes.func
};
