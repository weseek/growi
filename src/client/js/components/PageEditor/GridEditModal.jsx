import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

export default class GridEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      gridHtml: '',
    };

    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.pasteCodedGrid = this.pasteCodedGrid.bind(this);
  }

  init(gridHtml) {
    const initGridHtml = gridHtml;
    this.setState({ gridHtml: initGridHtml }, function() {
      // display gridHtml for re-editing
      console.log(this.state.gridHtml);
    });
  }

  show(gridHtml) {
    this.init(gridHtml);
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
    const pastedGridData = `::: editable-row\n<div class="container">\n  <div class="row">
    <div class="col-sm-6 col-md-5 col-lg-12">dummy</div>\n  </div>\n</div>\n:::`;

    if (this.props.onSave != null) {
      this.props.onSave(pastedGridData);
    }
    this.cancel();
  }

  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="xl">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Create Bootstrap 4 Grid
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col-5">
                <label htmlFor="gridPattern">Grid Pattern :</label>
                <div className="dropdown">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                  Grid Pattern
                  </button>
                  <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {/* TODO GW-3136 implement inside dropdown menu */}
                    <div className="container">
                      <div className="row">
                        <div className="col text-center">
                          2
                          <a className="dropdown-item" href="#">6:6</a>
                        </div>
                        <div className="col text-center">
                          3
                          <a className="dropdown-item" href="#">4:4:4</a>
                        </div>
                        <div className="col text-center">
                          4
                          <a className="dropdown-item" href="#">3:3:3:3</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-7">
                <label>Break point by display size :</label>
                <input type="radio" id="mobile" name="disSize" value="mobile" checked />
                <label htmlFor="mobile"><i className="icon-screen-smartphone"></i> Mobile</label>
                <input type="radio" id="tablet" name="disSize" value="tablet" />
                <label htmlFor="tablet"><i className="icon-screen-tablet"></i> Tablet</label>
                <input type="radio" id="desktop" name="disSize" value="desktop" />
                <label htmlFor="desktop"><i className="icon-screen-desktop"></i> Desktop</label>
                <input type="radio" id="none" name="disSize" value="none" />
                <label htmlFor="none">None</label>
              </div>
              <h1 className="w-100">Preview</h1>
              <div className="col-6 bg-dark">
                <label><i className="icon-screen-desktop"></i> Desktop</label>
                {/* desktop */}
              </div>
              <div className="col-4 bg-light">
                <label><i className="icon-screen-tablet"></i> Tablet</label>
                {/* tablet */}
              </div>
              <div className="col-2 bg-primary">
                <label><i className="icon-screen-smartphone"></i> Mobile</label>
                {/* mobile */}
              </div>
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
