import React from 'react';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import PublishLink from './PublishLink';

export default class LinkEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      inputValue: '',
      labelInputValue: '',
      linkerType: 'pukiwikiLink',
    };

    this.cancel = this.cancel.bind(this);
    this.toggleIsUseRelativePath = this.toggleIsUseRelativePath.bind(this);
    this.handleChangeLabelInput = this.handleChangeLabelInput.bind(this);
    this.handleSelecteLinkerType = this.handleSelecteLinkerType.bind(this);
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

  handleChangeLinkInput(linkValue) {
    this.setState({ inputValue: linkValue });
  }

  handleChangeLabelInput(labelValue) {
    this.setState({ labelInputValue: labelValue });
  }

  handleSelecteLinkerType(linkerType) {
    this.setState({ linkerType });
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
                    onChange={e => this.handleChangeLinkInput(e.target.value)}
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

              <div className="link-edit-tabs">
                <ul className="nav nav-tabs" role="tabist">
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      name="pukiwikiLink"
                      onClick={e => this.handleSelecteLinkerType(e.target.name)}
                      href="#Pukiwiki"
                      role="tab"
                      data-toggle="tab"
                    >
                      Pukiwiki
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      name="growiLink"
                      onClick={e => this.handleSelecteLinkerType(e.target.name)}
                      href="#Growi"
                      role="tab"
                      data-toggle="tab"
                    >
                      Growi Original
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      name="mdLink"
                      onClick={e => this.handleSelecteLinkerType(e.target.name)}
                      href="#MD"
                      role="tab"
                      data-toggle="tab"
                    >
                      Markdown
                    </a>
                  </li>
                </ul>

                <div className="tab-content pt-3">
                  <form className="form-group">
                    <div className="form-group">
                      <label htmlFor="label">Label</label>
                      <input
                        type="text"
                        className="form-control"
                        id="label"
                        value={this.state.labelInputValue}
                        onChange={e => this.handleChangeLabelInput(e.target.value)}
                        disabled={this.state.linkerType === 'growiLink'}
                      />
                      <PublishLink link={this.state.inputValue} label={this.state.labelInputValue} type={this.state.linkerType} />
                    </div>
                    <div className="form-inline">
                      <div className="custom-control custom-checkbox custom-checkbox-info">
                        <input
                          className="custom-control-input"
                          id="relativePath"
                          type="checkbox"
                          checked={this.state.isUseRelativePath}
                          disabled={this.state.linkerType === 'growiLink'}
                        />
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
