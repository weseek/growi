import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';
import Navbar from 'react-bootstrap/es/Navbar';
import ButtonGroup from 'react-bootstrap/es/ButtonGroup';
import Collapse from 'react-bootstrap/es/Collapse';
import FormGroup from 'react-bootstrap/es/FormGroup';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import FormControl from 'react-bootstrap/es/FormControl';

import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';

import MarkdownTable from '../../models/MarkdownTable';
import HandsontableUtil from './HandsontableUtil';

export default class HandsontableModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      markdownTableOnInit: HandsontableModal.getDefaultMarkdownTable(),
      markdownTable: HandsontableModal.getDefaultMarkdownTable(),
      handsontableSetting: HandsontableModal.getDefaultHandsontableSetting()
    };

    this.init = this.init.bind(this);
    this.reset = this.reset.bind(this);
    this.cancel = this.cancel.bind(this);
    this.save = this.save.bind(this);
  }

  init(markdownTable) {
    const initMarkdownTable = markdownTable || HandsontableModal.getDefaultMarkdownTable();
    this.setState(
      {
        markdownTableOnInit: initMarkdownTable,
        markdownTable: initMarkdownTable.clone(),
        handsontableSetting: Object.assign({}, this.state.handsontableSetting, {
          /*
           * The afterUpdateSettings hook is called when this component state changes.
           *
           * In detail, when this component state changes, React will re-render HotTable because it is passed some state values of this component.
           * HotTable#shouldComponentUpdate is called in this process and it call the updateSettings method for the Handsontable instance.
           * After updateSetting is executed, Handsontable calls a AfterUpdateSetting hook.
           */
          afterUpdateSettings: HandsontableUtil.createHandlerToSynchronizeHandontableAlignWith(initMarkdownTable.options.align)
        })
      }
    );
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
    let newMarkdownTable = this.state.markdownTable.clone();
    newMarkdownTable.options.align = HandsontableUtil.getMarkdownTableAlignmentFrom(this.refs.hotTable.hotInstance);

    if (this.props.onSave != null) {
      this.props.onSave(newMarkdownTable);
    }

    this.setState({ show: false });
  }

  setClassNameToColumns(className) {
    const selectedRange = this.refs.hotTable.hotInstance.getSelectedRange();
    if (selectedRange == null) return;

    let startCol;
    let endCol;

    if (selectedRange[0].from.col < selectedRange[0].to.col) {
      startCol = selectedRange[0].from.col;
      endCol = selectedRange[0].to.col;
    }
    else {
      startCol = selectedRange[0].to.col;
      endCol = selectedRange[0].from.col;
    }

    HandsontableUtil.setClassNameToColumns(this.refs.hotTable.hotInstance, startCol, endCol, className);
  }

  render() {
    return (
      <Modal show={this.state.show} onHide={this.cancel} bsSize="large" dialogClassName="handsontable-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edit Table</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Navbar>
            <Navbar.Form>
              <Button className="m-r-20" onClick={() => this.setState({ open: !this.state.open })}>Data Import</Button>
              <ButtonGroup>
                <Button onClick={() => { this.setClassNameToColumns('htLeft') }}><i className="ti-align-left"></i></Button>
                <Button onClick={() => { this.setClassNameToColumns('htCenter') }}><i className="ti-align-center"></i></Button>
                <Button onClick={() => { this.setClassNameToColumns('htRight') }}><i className="ti-align-right"></i></Button>
              </ButtonGroup>
            </Navbar.Form>
          </Navbar>
          <Collapse in={this.state.open}>
            <div> {/* This div is necessary for smoothing animations. (https://react-bootstrap.github.io/utilities/transitions/#transitions-collapse) */}
              <form action="" className="p-4 data-import-form">
                <FormGroup>
                  <ControlLabel>Select Data Format</ControlLabel>
                  <FormControl componentClass="select" placeholder="select">
                    <option value="select">CSV</option>
                    <option value="other">TSV</option>
                    <option value="other">HTML</option>
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Import Data</ControlLabel>
                  <FormControl componentClass="textarea" placeholder="Paste table data" style={{ height: 200 }}  />
                </FormGroup>
              </form>
            </div>
          </Collapse>
          <div className="p-4">
            <HotTable ref='hotTable' data={this.state.markdownTable.table} settings={this.state.handsontableSetting} />
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
    return new MarkdownTable(
      [
        ['col1', 'col2', 'col3'],
        ['', '', ''],
        ['', '', ''],
      ],
      {
        align: ['', '', '']
      }
    );
  }

  static getDefaultHandsontableSetting() {
    return {
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
                  HandsontableUtil.setClassNameToColumns(this, selection[0].start.col, selection[0].end.col, 'htLeft');
                }}, {
                name: 'Center',
                key: 'align_columns:2',
                callback: function(key, selection) {
                  HandsontableUtil.setClassNameToColumns(this, selection[0].start.col, selection[0].end.col, 'htCenter');
                }}, {
                name: 'Right',
                key: 'align_columns:3',
                callback: function(key, selection) {
                  HandsontableUtil.setClassNameToColumns(this, selection[0].start.col, selection[0].end.col, 'htRight');
                }}
              ]
            }
          }
        }
      },
      selectionMode: 'multiple',
      outsideClickDeselects: false,
      modifyColWidth: function(width) {
        if (width < 100) {
          return 100;
        }
        if (width > 300) {
          return 300;
        }
      }
    };
  }
}

HandsontableModal.propTypes = {
  onSave: PropTypes.func
};
