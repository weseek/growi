import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import geu from './GridEditorUtil';

export default class GridEditModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      colsRatios: [6, 6],
      responsiveSize: 'mobile',
      show: false,
      gridHtml: '',
    };

    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.pasteCodedGrid = this.pasteCodedGrid.bind(this);
    this.showGridPattern = this.showGridPattern.bind(this);
    this.checkResposiveSize = this.checkResposiveSize.bind(this);
  }

  async checkResposiveSize(responsiveSize) {
    await this.setState({ responsiveSize });
  }

  async checkColsRatios(colsRatios) {
    console.log(colsRatios);
    await this.setState({ colsRatios });
  }

  showGridPattern() {
    const colsRatios = this.state.colsRatios;
    const createdCol = colsRatios.map((colsRatio) => {
      return `- ${colsRatio} `;
    });
    return createdCol.join('').slice(1);
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
              <div className="col-3">
                <div className="mr-3 d-inline">
                  <label htmlFor="gridPattern">Grid Pattern :</label>
                </div>
                <button
                  className="btn btn-outline-secondary dropdown-toggle text-right col-12 col-md-auto"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {this.showGridPattern()}
                </button>
                <div className="dropdown-menu grid-division-menu" aria-labelledby="dropdownMenuButton">
                  <GridDivisionMenu />
                </div>
              </div>
              <div className="col-3 text-right pr-0">
                <label className="pr-3">Break point by display size :</label>
              </div>
              <div className="col-3 text-left pl-0">
                <div className="form-group inline-block">
                  <div>
                    <input
                      type="radio"
                      id="mobile"
                      name="responsiveSize"
                      value="mobile"
                      onChange={() => { this.checkResposiveSize('mobile') }}
                      checked={this.state.responsiveSize === 'mobile'}
                    />
                    <label htmlFor="mobile">
                      <i className="pl-2 pr-1 icon-screen-smartphone "></i> Mobile / No break point
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="tablet"
                      name="responsiveSize"
                      value="tablet"
                      onChange={() => { this.checkResposiveSize('tablet') }}
                      checked={this.state.responsiveSize === 'tablet'}
                    />
                    <label htmlFor="tablet">
                      <i className="pl-2 pr-1 icon-screen-tablet"></i> Tablet
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="desktop"
                      name="responsiveSize"
                      value="desktop"
                      onChange={() => { this.checkResposiveSize('desktop') }}
                      checked={this.state.responsiveSize === 'desktop'}
                    />
                    <label htmlFor="desktop">
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
  const gridDivisions = geu.mappingAllGridDivisionPatterns;
  return (
    <div className="container">
      <div className="row">
        {gridDivisions.map((gridDivion, i) => {
          return (
            <div className="col-md-4 text-center">
              <h6 className="dropdown-header">{i + 2}分割</h6>
              {gridDivion.map((gridOneDivision) => {
                return (
                  <a className="dropdown-item" href="#" onClick={() => { this.checkColsRatios(gridOneDivision) }}>
                    <div className="row">
                      {gridOneDivision.map((gtd) => {
                        const className = `bg-info col-${gtd} border`;
                        return <span className={className}>{gtd}</span>;
                      })}
                    </div>
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

GridEditModal.propTypes = {
  onSave: PropTypes.func,
};
