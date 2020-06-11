import React from 'react';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

export default class LinkEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      inputValue: '~.cloud.~',
      labelInputValue: 'ここがリンク',
    };

    this.cancel = this.cancel.bind(this);
    this.toggleIsUseRelativePath = this.toggleIsUseRelativePath.bind(this);
    this.showLog = this.showLog.bind(this);
  }

  show() {
    this.setState({ show: true });
  }

  cancel() {
    this.hide();
  }

  hide() {
    this.setState({
      show: false,
    });
  }

  toggleIsUseRelativePath() {
    this.setState({ isUseRelativePath: !this.state.isUseRelativePath });
  }

  renderPreview() {
    // TODO GW-2658
  }

  insertLinkIntoEditor() {
    // TODO GW-2659
  }

  showLog() {
    console.log(this.state.inputValue);
  }

  handleInputChange(linkValue) {
    this.setState({ inputValue: linkValue });
  }

  labelInputChange(labelValue) {
    this.setState({ labelInputValue: labelValue });
  }


  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="lg">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Links
        </ModalHeader>

        <ModalBody className="container">
          <div className="row">
            <div className="col">
              <div className="form-gorup my-3">
                <label htmlFor="linkInput">Link</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    id="linkInput"
                    type="text"
                    placeholder="/foo/bar/31536000"
                    aria-describedby="button-addon"
                    value={this.state.inputValue}
                    onChange={e => this.handleInputChange(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button type="button" id="button-addon" className="btn btn-secondary" onClick={this.showLog}>
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="d-block d-lg-none">
                {this.renderPreview}
                render preview
              </div>

              <div className="linkedit-tabs">
                <ul className="nav nav-tabs" role="tabist">
                  <li className="nav-item">
                    <a className="nav-link active" href="#Pukiwiki" role="tab" data-toggle="tab">
                      Pukiwiki
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#Crowi" role="tab" data-toggle="tab">
                      Crowi
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#MD" role="tab" data-toggle="tab">
                      MD
                    </a>
                  </li>
                </ul>

                <div className="tab-content pt-3">
                  <div id="Pukiwiki" className="tab-pane active" role="tabpanel">
                    <form className="form-group">
                      <div className="form-group">
                        <label htmlFor="pukiwikiLink">Label</label>
                        <input
                          type="text"
                          className="form-control"
                          id="pukiwikiLink"
                          value={this.state.labelInputValue}
                          onChange={e => this.labelInputChange(e.target.value)}
                        />
                      </div>
                      <span className="p-2">[[{this.state.labelInputValue} &gt; {this.state.inputValue}]]</span>
                      <div>
                      </div>
                      <div className="form-inline">
                        <div className="custom-control custom-checkbox custom-checkbox-info">
                          <input className="custom-control-input" id="relativePath" type="checkbox" checked={this.state.isUseRelativePath} />
                          <label className="custom-control-label" htmlFor="relativePath" onClick={this.toggleIsUseRelativePath}>
                            Use relative path
                          </label>
                        </div>
                        <button type="button" className="btn btn-primary ml-auto">
                          Done
                        </button>
                      </div>
                    </form>
                  </div>

                  <div id="Crowi" className="tab-pane" role="tabpanel">
                    <form className="form-group">
                      <div className="form-group">
                        <label htmlFor="crowiLink">Label</label>
                        <input type="text" className="form-control" id="crowiLink"></input>
                      </div>
                      <div>
                        <span>URI</span>
                      </div>
                      <div className="d-flex">
                        <button type="button" className="btn btn-primary ml-auto">
                          Done
                        </button>
                      </div>
                    </form>
                  </div>

                  <div id="MD" className="tab-pane" role="tabpanel">
                    <form className="form-group">
                      <div className="form-group">
                        <label htmlFor="MDLink">Label</label>
                        <input type="text" className="form-control" id="MDLink"></input>
                      </div>
                      <div>
                        <span>URI</span>
                      </div>
                      <div className="form-inline">
                        <div className="custom-control custom-checkbox custom-checkbox-info">
                          <input className="custom-control-input" id="relativePath" type="checkbox" checked={this.state.isUseRelativePath} />
                          <label className="custom-control-label" htmlFor="relativePath" onClick={this.toggleIsUseRelativePath}>
                            Use relative path
                          </label>
                        </div>
                        <button type="button" className="btn btn-primary ml-auto">
                          Done
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="col d-none d-lg-block">
              {this.renderPreview}
              render preview
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }

}
