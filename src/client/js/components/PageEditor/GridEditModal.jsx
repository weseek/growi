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
      // colsRatios: [6, 6],
      responsiveSize: 'mobile',
      show: false,
      gridHtml: '',
    };

    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.pasteCodedGrid = this.pasteCodedGrid.bind(this);
    /* this.handleChange = this.handleChange.bind(this); */
  }

  /* async handleChange(event) {
    await this.setState({ responsiveSize: event.target.value });
    console.log(this.state.responsiveSize);
    console.log(this.state.responsiveSize === 'mobile');

  } */

  /* handleChange = async(e) => {
    console.log(`${e.target.value}hoge`);
    await this.setState({
      responsiveSize: e.target.value,
    }, function() {
      console.log(this.state.responsiveSize);
    });
    console.log(this.state.responsiveSize === 'mobile');
  } */

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
    const convertedHTML = geu.convertRatiosAndSizeToHTML([1, 5, 6], 'sm');
    const pastedGridData = `::: editable-row\n<div class="container">\n\t<div class="row">\n${convertedHTML}\n\t</div>\n</div>\n:::`;
    // display converted html on console
    console.log(convertedHTML);

    if (this.props.onSave != null) {
      this.props.onSave(pastedGridData);
    }
    this.cancel();
  }


  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="xl" className="grw-grid-edit-modal">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Create Bootstrap 4 Grid
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col-4">
                <div className="mr-3 d-inline">
                  <label htmlFor="gridPattern">Grid Pattern :</label>
                </div>

                <div className="dropdown d-inline">
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
                  <div className="dropdown-menu grid-division-menu" aria-labelledby="dropdownMenuButton">
                    <GridDivisionMenu />
                  </div>
                </div>
              </div>
              <div className="col-4 text-right pr-0">
                <label className="pr-3">Break point by display size :</label>
              </div>
              <div className="col-4 text-left pl-0">
                <div className="form-group inline-block">
                  <div className="">
                    <input
                      className=""
                      type="radio"
                      id="mobile"
                      name="responsiveSize"
                      value="mobile"
                      onChange={(e) => { this.setState({ responsiveSize: e.target.value }) }}
                      checked={this.state.responsiveSize === 'mobile'}
                    />
                    <label className="" htmlFor="mobile">
                      <i className="pl-2 pr-1 icon-screen-smartphone "></i> Mobile / No break point
                    </label>
                  </div>
                  <div className="">
                    <input
                      className=""
                      type="radio"
                      id="tablet"
                      name="responsiveSize"
                      value="tablet"
                      onChange={(e) => { this.setState({ responsiveSize: e.target.value }) }}
                      checked={this.state.responsiveSize === 'tablet'}
                    />
                    <label className="" htmlFor="tablet">
                      <i className="pl-2 pr-1 icon-screen-tablet"></i> Tablet
                    </label>
                  </div>
                  <div className="">
                    <input
                      className=""
                      type="radio"
                      id="desktop"
                      name="responsiveSize"
                      value="desktop"
                      onChange={(e) => { this.setState({ responsiveSize: e.target.value }) }}
                      checked={this.state.responsiveSize === 'desktop'}
                    />
                    <label className="" htmlFor="desktop">
                      <i className="pl-2 pr-1 icon-screen-desktop"></i> Desktop
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <h1 className="pl-3 w-100">Preview</h1>
              <div className="col-6">
                <label className="d-block"><i className="pr-2 icon-screen-desktop"></i>Desktop</label>
                <div className="desktop-preview border d-block"></div>
              </div>
              <div className="col-3">
                <label className="d-block"><i className="pr-2 icon-screen-tablet"></i>Tablet</label>
                <div className="tablet-preview border d-block"></div>
              </div>
              <div className="col-3">
                <label className="d-block"><i className="pr-2 icon-screen-smartphone"></i>Mobile</label>
                <div className="mobile-preview border d-block"></div>
              </div>
            </div>
          </div>


        </ModalBody>
        <ModalFooter className="grw-modal-footer">
          <div className="ml-auto">
            <button type="button" className="mr-2 btn btn-secondary" onClick={this.cancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={this.pasteCodedGrid}>
              Done
            </button>
          </div>
        </ModalFooter>
      </Modal>
    );
  }

}

function GridDivisionMenu() {
  return (
    <div className="container">
      <div className="row">
        {/* TODO: add other grid patterns by GW-3189 */}
        <div className="col-md-4 text-center">
          <h6 className="dropdown-header">2分割</h6>
          <a className="dropdown-item" href="#">
            <div className="row">
              <span className="bg-info col-6 border">6</span>
              <span className="bg-info col-6 border">6</span>
            </div>
          </a>
        </div>
        <div className="col-md-4 text-center">
          <h6 className="dropdown-header">3分割</h6>
          <a className="dropdown-item" href="#">
            <div className="row">
              <span className="bg-info col-4 border">4</span>
              <span className="bg-info col-4 border">4</span>
              <span className="bg-info col-4 border">4</span>
            </div>
          </a>
        </div>
        <div className="col-md-4 text-center">
          <h6 className="dropdown-header">4分割</h6>
          <a className="dropdown-item" href="#">
            <div className="row">
              <span className="bg-info col-3 border">3</span>
              <span className="bg-info col-3 border">3</span>
              <span className="bg-info col-3 border">3</span>
              <span className="bg-info col-3 border">3</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

GridEditModal.propTypes = {
  onSave: PropTypes.func,
};
