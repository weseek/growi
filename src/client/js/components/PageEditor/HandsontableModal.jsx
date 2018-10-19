import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';
import Navbar from 'react-bootstrap/es/Navbar';
import ButtonGroup from 'react-bootstrap/es/ButtonGroup';

import { debounce } from 'throttle-debounce';

import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';

import MarkdownTable from '../../models/MarkdownTable';
import HandsontableUtil from './HandsontableUtil';

const DEFAULT_HOT_HEIGHT = 300;

export default class HandsontableModal extends React.Component {


  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isWindowExpanded: false,
      markdownTableOnInit: HandsontableModal.getDefaultMarkdownTable(),
      markdownTable: HandsontableModal.getDefaultMarkdownTable(),
      handsontableHeight: DEFAULT_HOT_HEIGHT,
      handsontableSetting: HandsontableModal.getDefaultHandsontableSetting()
    };

    this.init = this.init.bind(this);
    this.reset = this.reset.bind(this);
    this.cancel = this.cancel.bind(this);
    this.save = this.save.bind(this);
    this.expandWindow = this.expandWindow.bind(this);
    this.contractWindow = this.contractWindow.bind(this);

    // create debounced method for expanding HotTable
    this.expandHotTableHeightWithDebounce = debounce(100, this.expandHotTableHeight);
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

  expandWindow() {
    this.setState({ isWindowExpanded: true });

    // invoke updateHotTableHeight method with delay
    // cz. Resizing this.refs.hotTableContainer is completeted after a little delay after 'isWindowExpanded' set with 'true'
    this.expandHotTableHeightWithDebounce();
  }

  contractWindow() {
    this.setState({ isWindowExpanded: false, handsontableHeight: DEFAULT_HOT_HEIGHT });
  }

  /**
   * Expand the height of the Handsontable
   *  by updating 'handsontableHeight' state
   *  according to the height of this.refs.hotTableContainer
   */
  expandHotTableHeight() {
    if (this.state.isWindowExpanded && this.refs.hotTableContainer != null) {
      const height = this.refs.hotTableContainer.getBoundingClientRect().height;
      this.setState({ handsontableHeight: height });
    }
  }

  renderExpandOrContractButton() {
    const iconClassName = this.state.isWindowExpanded ? 'icon-size-actual' : 'icon-size-fullscreen';
    return (
      <button className="close mr-3" onClick={this.state.isWindowExpanded ? this.contractWindow : this.expandWindow}>
        <i className={iconClassName} style={{ fontSize: '0.8em' }} aria-hidden="true"></i>
      </button>
    );
  }

  render() {
    const dialogClassNames = ['handsontable-modal'];
    if (this.state.isWindowExpanded) {
      dialogClassNames.push('handsontable-modal-expanded');
    }

    const dialogClassName = dialogClassNames.join(' ');

    return (
      <Modal show={this.state.show} onHide={this.cancel} bsSize="large" dialogClassName={dialogClassName}>
        <Modal.Header closeButton>
          { this.renderExpandOrContractButton() }
          <Modal.Title>Edit Table</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column">
          <Navbar>
            <Navbar.Form>
              <ButtonGroup>
                <Button onClick={() => { this.setClassNameToColumns('htLeft') }}><i className="ti-align-left"></i></Button>
                <Button onClick={() => { this.setClassNameToColumns('htCenter') }}><i className="ti-align-center"></i></Button>
                <Button onClick={() => { this.setClassNameToColumns('htRight') }}><i className="ti-align-right"></i></Button>
              </ButtonGroup>
            </Navbar.Form>
          </Navbar>
          <div ref="hotTableContainer" className="m-4 hot-table-container">
            <HotTable ref='hotTable' data={this.state.markdownTable.table} settings={this.state.handsontableSetting} height={this.state.handsontableHeight} />
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
      rowHeaders: true,
      colHeaders: true,
      manualRowMove: true,
      manualRowResize: true,
      manualColumnMove: true,
      manualColumnResize: true,
      selectionMode: 'multiple',
      outsideClickDeselects: false,

      modifyColWidth: function(width) {
        return Math.max(80, Math.min(400, width));
      },

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
      }

    };
  }
}

HandsontableModal.propTypes = {
  onSave: PropTypes.func
};
