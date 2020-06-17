import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import Preview from './Preview';

import AppContainer from '../../services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

class LinkEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      inputValue: '~.cloud.~',
      labelInputValue: 'ここがリンク',
      markdown: '',
    };

    this.cancel = this.cancel.bind(this);
    this.toggleIsUseRelativePath = this.toggleIsUseRelativePath.bind(this);
    this.setMarkdown = this.setMarkdown.bind(this);
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
    return (
      <div className="linkedit-preview">
        <Preview
          markdown={this.state.markdown}
          inputRef={() => {}}
        />
      </div>
    );
  }

  insertLinkIntoEditor() {
    // TODO GW-2659
  }

  async setMarkdown() {
    let markdown = '';
    try {
      await this.props.appContainer.apiGet('/pages.get', { path: this.state.inputValue }).then((res) => {
        markdown = res.page.revision.body;
      });
    }
    catch (err) {
      markdown = `<div class="alert alert-warning" role="alert"><strong>${err.message}</strong></div>`;
    }
    this.setState({ markdown });
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
          <div className="row h-100">
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
                    <button
                      type="button"
                      id="button-addon"
                      className="btn btn-secondary"
                      onClick={this.setMarkdown}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="d-block d-lg-none mb-3">
                {this.renderPreview()}
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
              {this.renderPreview()}
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }

}

const LinkEditModalWrapper = withUnstatedContainers(LinkEditModal, [AppContainer]);

LinkEditModal.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};
export default LinkEditModalWrapper;
