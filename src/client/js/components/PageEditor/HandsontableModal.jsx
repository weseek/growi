import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';
import ButtonGroup from 'react-bootstrap/es/ButtonGroup';

import { debounce } from 'throttle-debounce';
import Collapse from 'react-bootstrap/es/Collapse';
import FormGroup from 'react-bootstrap/es/FormGroup';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import FormControl from 'react-bootstrap/es/FormControl';

import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';

import MarkdownTable from '../../models/MarkdownTable';

const DEFAULT_HOT_HEIGHT = 300;
const MARKDOWNTABLE_TO_HANDSONTABLE_ALIGNMENT_SYMBOL_MAPPING = {
  'r': 'htRight',
  'c': 'htCenter',
  'l': 'htLeft',
  '': ''
};

export default class HandsontableModal extends React.PureComponent {


  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isDataImportAreaExpanded: false,
      isWindowExpanded: false,
      markdownTableOnInit: HandsontableModal.getDefaultMarkdownTable(),
      markdownTable: HandsontableModal.getDefaultMarkdownTable(),
      handsontableHeight: DEFAULT_HOT_HEIGHT,
    };

    this.init = this.init.bind(this);
    this.reset = this.reset.bind(this);
    this.cancel = this.cancel.bind(this);
    this.save = this.save.bind(this);
    this.afterLoadDataHandler = this.afterLoadDataHandler.bind(this);
    this.beforeColumnMoveHandler = this.beforeColumnMoveHandler.bind(this);
    this.beforeColumnResizeHandler = this.beforeColumnResizeHandler.bind(this);
    this.afterColumnResizeHandler = this.afterColumnResizeHandler.bind(this);
    this.modifyColWidthHandler = this.modifyColWidthHandler.bind(this);
    this.synchronizeAlignment = this.synchronizeAlignment.bind(this);
    this.alignButtonHandler = this.alignButtonHandler.bind(this);
    this.toggleDataImportArea = this.toggleDataImportArea.bind(this);
    this.expandWindow = this.expandWindow.bind(this);
    this.contractWindow = this.contractWindow.bind(this);

    // create debounced method for expanding HotTable
    this.expandHotTableHeightWithDebounce = debounce(100, this.expandHotTableHeight);

    // a Set instance that stores column indices which are resized manually.
    // these columns will NOT be determined the width automatically by 'modifyColWidthHandler'
    this.manuallyResizedColumnIndicesSet = new Set();

    // generate setting object for HotTable instance
    this.handsontableSettings = Object.assign(HandsontableModal.getDefaultHandsontableSetting(), {
      contextMenu: this.createCustomizedContextMenu(),
    });
  }

  init(markdownTable) {
    const initMarkdownTable = markdownTable || HandsontableModal.getDefaultMarkdownTable();
    this.setState(
      {
        markdownTableOnInit: initMarkdownTable,
        markdownTable: initMarkdownTable.clone(),
      }
    );

    this.manuallyResizedColumnIndicesSet.clear();
  }

  createCustomizedContextMenu() {
    return {
      items: {
        'row_above': {}, 'row_below': {}, 'col_left': {}, 'col_right': {},
        'separator1': Handsontable.plugins.ContextMenu.SEPARATOR,
        'remove_row': {}, 'remove_col': {},
        'separator2': Handsontable.plugins.ContextMenu.SEPARATOR,
        'custom_alignment': {
          name: 'Align columns',
          key: 'align_columns',
          submenu: {
            items: [
              {
                name: 'Left',
                key: 'align_columns:1',
                callback: (key, selection) => {this.align('l', selection[0].start.col, selection[0].end.col)}
              }, {
                name: 'Center',
                key: 'align_columns:2',
                callback: (key, selection) => {this.align('c', selection[0].start.col, selection[0].end.col)}
              }, {
                name: 'Right',
                key: 'align_columns:3',
                callback: (key, selection) => {this.align('r', selection[0].start.col, selection[0].end.col)}
              }
            ]
          }
        }
      }
    };
  }

  show(markdownTable) {
    this.init(markdownTable);
    this.setState({ show: true });
  }

  hide() {
    this.setState({
      show: false,
      isDataImportAreaExpanded: false,
      isWindowExpanded: false,
    });
  }

  reset() {
    this.setState({ markdownTable: this.state.markdownTableOnInit.clone() });
  }

  cancel() {
    this.hide();
  }

  save() {
    if (this.props.onSave != null) {
      this.props.onSave(this.state.markdownTable);
    }

    this.hide();
  }

  afterLoadDataHandler(initialLoad) {
    // clear 'manuallyResizedColumnIndicesSet' for the first loading
    if (initialLoad) {
      this.manuallyResizedColumnIndicesSet.clear();
    }

    this.synchronizeAlignment();
  }

  beforeColumnMoveHandler(columns, target) {
    // clear 'manuallyResizedColumnIndicesSet'
    this.manuallyResizedColumnIndicesSet.clear();
  }

  beforeColumnResizeHandler(currentColumn) {
    /*
     * The following bug disturbs to use 'beforeColumnResizeHandler' to store column index -- 2018.10.23 Yuki Takei
     * https://github.com/handsontable/handsontable/issues/3328
     *
     * At the moment, using 'afterColumnResizeHandler' instead.
     */

    // store column index
    // this.manuallyResizedColumnIndicesSet.add(currentColumn);
  }

  afterColumnResizeHandler(currentColumn) {
    /*
     * The following bug disturbs to use 'beforeColumnResizeHandler' to store column index -- 2018.10.23 Yuki Takei
     * https://github.com/handsontable/handsontable/issues/3328
     *
     * At the moment, using 'afterColumnResizeHandler' instead.
     */

    // store column index
    this.manuallyResizedColumnIndicesSet.add(currentColumn);
    // force re-render
    const hotInstance = this.refs.hotTable.hotInstance;
    hotInstance.render();
  }

  modifyColWidthHandler(width, column) {
    // return original width if the column index exists in 'manuallyResizedColumnIndicesSet'
    if (this.manuallyResizedColumnIndicesSet.has(column)) {
      return width;
    }
    // return fixed width if first initializing
    return Math.max(80, Math.min(400, width));
  }

  /**
   * change the markdownTable alignment and synchronize the handsontable alignment to it
   */
  align(direction, startCol, endCol) {
    this.setState((prevState) => {
      // change only align info, so share table data to avoid redundant copy
      const newMarkdownTable = new MarkdownTable(prevState.markdownTable.table, {align: [].concat(prevState.markdownTable.options.align)});
      for (let i = startCol; i <= endCol ; i++) {
        newMarkdownTable.options.align[i] = direction;
      }
      return { markdownTable: newMarkdownTable };
    }, () => {
      this.synchronizeAlignment();
    });
  }

  /**
   * synchronize the handsontable alignment to the markdowntable alignment
   */
  synchronizeAlignment() {
    if (this.refs.hotTable == null) {
      return;
    }

    const align = this.state.markdownTable.options.align;
    const hotInstance = this.refs.hotTable.hotInstance;

    for (let i = 0; i < align.length; i++) {
      for (let j = 0; j < hotInstance.countRows(); j++) {
        hotInstance.setCellMeta(j, i, 'className', MARKDOWNTABLE_TO_HANDSONTABLE_ALIGNMENT_SYMBOL_MAPPING[align[i]]);
      }
    }
    hotInstance.render();
  }

  alignButtonHandler(direction) {
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

    this.align(direction, startCol, endCol);
  }

  toggleDataImportArea() {
    this.setState({ isDataImportAreaExpanded: !this.state.isDataImportAreaExpanded });
  }

  expandWindow() {
    this.setState({ isWindowExpanded: true });

    // invoke updateHotTableHeight method with delay
    // cz. Resizing this.refs.hotTableContainer is completed after a little delay after 'isWindowExpanded' set with 'true'
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
          <div className="px-4 py-3 modal-navbar">
            <Button className="m-r-20 data-import-button" onClick={this.toggleDataImportArea}>
              Data Import<i className={this.state.isDataImportAreaExpanded ? 'fa fa-angle-up' : 'fa fa-angle-down' }></i>
            </Button>
            <ButtonGroup>
              <Button onClick={() => { this.alignButtonHandler('l') }}><i className="ti-align-left"></i></Button>
              <Button onClick={() => { this.alignButtonHandler('c') }}><i className="ti-align-center"></i></Button>
              <Button onClick={() => { this.alignButtonHandler('r') }}><i className="ti-align-right"></i></Button>
            </ButtonGroup>
            <Collapse in={this.state.isDataImportAreaExpanded}>
              <div> {/* This div is necessary for smoothing animations. (https://react-bootstrap.github.io/utilities/transitions/#transitions-collapse) */}
                <form action="" className="data-import-form pt-5">
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
                  <div className="d-flex justify-content-end">
                    <Button bsStyle="default" onClick={this.toggleDataImportArea}>Cancel</Button>
                    <Button bsStyle="primary">Import</Button>
                  </div>
                </form>
              </div>
            </Collapse>
          </div>
          <div ref="hotTableContainer" className="m-4 hot-table-container">
            <HotTable ref='hotTable' data={this.state.markdownTable.table}
                settings={this.handsontableSettings} height={this.state.handsontableHeight}
                afterLoadData={this.afterLoadDataHandler}
                modifyColWidth={this.modifyColWidthHandler}
                beforeColumnMove={this.beforeColumnMoveHandler}
                beforeColumnResize={this.beforeColumnResizeHandler}
                afterColumnResize={this.afterColumnResizeHandler}
              />
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
    };
  }
}

HandsontableModal.propTypes = {
  onSave: PropTypes.func
};
