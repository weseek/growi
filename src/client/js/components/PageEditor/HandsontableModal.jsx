import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';
import Navbar from 'react-bootstrap/es/Navbar';
import ButtonGroup from 'react-bootstrap/es/ButtonGroup';

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
      handsontableSetting: HandsontableModal.getDefaultHandsotableSetting()
    };

    this.init = this.init.bind(this);
    this.reset = this.reset.bind(this);
    this.cancel = this.cancel.bind(this);
    this.save = this.save.bind(this);

    this.storeSelectedRange = this.storeSelectedRange.bind(this);
    this.clearSelectedRange = this.clearSelectedRange.bind(this);
  }

  init(markdownTable) {
    const initMarkdownTable = markdownTable || HandsontableModal.getDefaultMarkdownTable();
    this.setState(
      {
        markdownTableOnInit: initMarkdownTable,
        markdownTable: initMarkdownTable.clone(),
        handsontableSetting: Object.assign({}, this.state.handsontableSetting, {
          /*
           * AfterUpdateSettings hook is called when this component state changes.
           *
           * In detail, when this component state changes, React will re-render HotTable because it is passed some state values of this component.
           * HotTable#shouldComponentUpdate is called in this process and it call the updateSettings method for the Handsontable instance.
           * After updateSetting is executed, Handsontable calls a AfterUpdateSetting hook.
           */
          afterUpdateSettings: HandsontableUtil.createHandlerToSynchronizeHandontableAlignWith(initMarkdownTable.options.align),
          afterSelectionEnd: this.storeSelectedRange
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

  /**
   * store the latest selected range in HotTable
   *
   * This uses property instead of state for storing latestSelectedRange and avoid calling afterUpdateSettings hook
   */
  storeSelectedRange() {
    this.latestSelectedRange = this.refs.hotTable.hotInstance.getSelectedRange();
  }

  /**
   * clear the latest selected range in HotTable
   */
  clearSelectedRange() {
    this.latestSelectedRange = null;
  }

  /**
   * stop propagation to prevent 'clearSelectedRange' from being called when a click event is dispatched in HotTable
   */
  stopPropagation(e) {
    e.stopPropagation();
  }

  setClassNameToColumns(className) {
    if (this.latestSelectedRange == null) return;

    let startCol;
    let endCol;

    if (this.latestSelectedRange[0].from.col < this.latestSelectedRange[0].to.col) {
      startCol = this.latestSelectedRange[0].from.col;
      endCol = this.latestSelectedRange[0].to.col;
    }
    else {
      startCol = this.latestSelectedRange[0].to.col;
      endCol = this.latestSelectedRange[0].from.col;
    }

    HandsontableUtil.setClassNameToColumns(this.refs.hotTable.hotInstance, startCol, endCol, className);
  }

  render() {
    return (
      <div onClick={this.clearSelectedRange}>
        <Modal show={this.state.show} bsSize="large">
          <Modal.Header closeButton>
            <Modal.Title>Edit Table</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <Navbar>
              <Navbar.Form>
                <ButtonGroup>
                  <Button onClick={() => { this.setClassNameToColumns('htLeft') }}><i className="ti-align-left"></i></Button>
                  <Button onClick={() => { this.setClassNameToColumns('htCenter') }}><i className="ti-align-center"></i></Button>
                  <Button onClick={() => { this.setClassNameToColumns('htRight') }}><i className="ti-align-right"></i></Button>
                </ButtonGroup>
              </Navbar.Form>
            </Navbar>
            <div className="p-4" onClick={this.stopPropagation.bind(this)}>
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
      </div>
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

  static getDefaultHandsotableSetting() {
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
      stretchH: 'all',
      selectionMode: 'multiple'
    };
  }
}

HandsontableModal.propTypes = {
  onSave: PropTypes.func
};
