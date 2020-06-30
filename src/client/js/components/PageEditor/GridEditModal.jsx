import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import geu from './GridEditorUtil';

export default class GridEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.pasteCodedGrid = this.pasteCodedGrid.bind(this);
  }

  show() {
    this.expandGridDiagram();
    this.setState({ show: true });
  }

  hide() {
    this.setState({ show: false });
  }

  cancel() {
    this.hide();
  }

  pasteCodedGrid() {
    // dummy data
    const pastedGridData = '<div class="container"><div class="row"><div class="col-sm-6 col-md-5 col-lg-12">dummy</div></div></div>';
    if (this.props.onSave != null) {
      this.props.onSave(pastedGridData);
    }
    this.cancel();
  }

  expandGridDiagram(isCursorInGrid, gridHtml) {
    let gridFigureOnModal;
    if (isCursorInGrid) {
      gridFigureOnModal = gridHtml;
      return gridFigureOnModal;
    }
  }

  showBgCols() {
    const cols = [];
    for (let i = 0; i < 12; i++) {
      cols.push(<div className="bg-light grid-bg-col col-1"></div>);
    }
    return cols;
  }

  // Get the already pasted code from the editor and expand it on the modal
  getPastedGrid(edited) {
    // When the cursor on editor is in row
    if (edited) {
      // Embed the html data in cols.
    }
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
              <div className="col-3">
                <h5>Phone</h5>
                <div className="device-container"></div>
                <h5>Tablet</h5>
                <div className="device-container"></div>
                <h5>Desktop</h5>
                <div className="device-container"></div>
                <h5>Large Desktop</h5>
                <div className="device-container"></div>
              </div>
              <div className="row col-9 flex-nowrap overflow-auto">{this.showBgCols()}</div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="grw-modal-footer">
          <div className="ml-auto">
            <button type="button" className="mr-2 btn btn-secondary" onClick={this.cancel}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={this.pasteCodedGrid}>Done</button>
          </div>
        </ModalFooter>
      </Modal>
    );
  }

}

GridEditModal.propTypes = {
  onSave: PropTypes.func,
};
