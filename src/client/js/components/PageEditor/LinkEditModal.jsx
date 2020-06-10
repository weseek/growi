import React from 'react';

import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import PublishLink from './PublishLink';

export default class LinkEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      link: '/hoge/fuga/1234', // [TODO] GW-2793 の変更を適用する
      label: '',
      linkerType: 'pukiwikiLink',
    };

    this.cancel = this.cancel.bind(this);
    this.toggleIsUseRelativePath = this.toggleIsUseRelativePath.bind(this);
    this.handleChangeLabelInput = this.handleChangeLabelInput.bind(this);
    this.handleSelecteLinkerType = this.handleSelecteLinkerType.bind(this);
    this.generateLinker = this.generateLinker.bind(this);
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

  handleChangeLabelInput(e) {
    const label = e.target.value;
    // const linkerType = e.target.id;
    // const linker = this.generateLinker(label, linkerType);
    // this.setState({ label, linker });
    this.setState({ label });
  }

  generateLinker() {
    let linker;
    const label = this.state.label;
    const type = this.state.linkerType;
    if (type === 'pukiwikiLink') {
      linker = `[[${label}]]`;
    }
    if (type === 'growiLink') {
      linker = `growi ${label}`;
    }
    if (type === 'MDLink') {
      linker = `md like ${label}`;
    }

    return linker;
  }


  handleSelecteLinkerType(e) {
    this.setState({ linkerType: e.currentTarget.name });
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

  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="lg">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Table
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
                    value={this.state.link}
                  />
                  <div className="input-group-append">
                    <button type="button" id="button-addon" className="btn btn-secondary">
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
                    <a className="nav-link active" name="pukiwikiLink" onClick={this.handleSelecteLinkerType} href="#Pukiwiki" role="tab" data-toggle="tab">
                      Pukiwiki
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" name="growiLink" onClick={this.handleSelecteLinkerType} href="#Growi" role="tab" data-toggle="tab">
                      Growi Original
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" name="MDLink" onClick={this.handleSelecteLinkerType} href="#MD" role="tab" data-toggle="tab">
                      Markdown
                    </a>
                  </li>
                </ul>

                <div className="tab-content pt-3">
                  <form className="form-group">
                    <div className="form-group">
                      <label htmlFor="pukiwikiLink">Label</label>
                      <input
                        type="text"
                        className="form-control"
                        id="pukiwikiLink"
                        value={this.state.label}
                        onChange={this.handleChangeLabelInput}
                        disabled={this.state.linkerType === 'growiLink'}
                      />
                    </div>
                    <div className="form-group">
                      <PublishLink
                        link={this.state.link}
                        label={this.state.label}
                        type={this.state.linkerType}
                        isUseRelativePath={this.state.isUseRelativePath}
                      />
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
