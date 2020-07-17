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
                <div className="d-inline-block">
                  <div className="custom-control custom-radio ">
                    <div>
                      <input
                        type="radio"
                        id="mobile"
                        className="custom-control-input"
                        name="disSize"
                        value="mobile"
                        checked
                      />
                      <label className="custom-control-label" htmlFor="mobile">
                        <i className="pl-2 pr-1 icon-screen-smartphone "></i> Mobile
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="tablet"
                        className="custom-control-input"
                        name="disSize"
                        value="tablet"
                      />
                      <label className="custom-control-label" htmlFor="tablet">
                        <i className="pl-2 pr-1 icon-screen-tablet"></i> Tablet
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="desktop"
                        className="custom-control-input"
                        name="disSize"
                        value="desktop"
                      />
                      <label className="custom-control-label" htmlFor="desktop">
                        <i className="pl-2 pr-1 icon-screen-desktop"></i> Desktop
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="none"
                        className="custom-control-input"
                        name="disSize"
                        value="none"
                      />
                      <label className="custom-control-label pl-2" htmlFor="none">None</label>
                    </div>
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
    <div className="row">
      {gridDivisions.map((gridDivion, i) => {
        return (
          <div className="col-md-4 text-center">
            <h6 className="dropdown-header">{i + 2}分割</h6>
            {gridDivion.map((gridOneDivision) => {
              return (
                <a className="dropdown-item" href="#">
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
  );
}

GridEditModal.propTypes = {
  onSave: PropTypes.func,
};
