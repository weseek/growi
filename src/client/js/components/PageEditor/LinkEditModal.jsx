import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import PagePathAutoComplete from '../PagePathAutoComplete';


export default class LinkEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      isUseRelativePath: false,
      linkInputValue: '',
      labelInputValue: '',
      output: '[label](link)',
    };

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.toggleIsUseRelativePath = this.toggleIsUseRelativePath.bind(this);
    this.showLog = this.showLog.bind(this);
    this.save = this.save.bind(this);
  }

  show(defaultLabelInputValue = '') {
    this.setState({ show: true, labelInputValue: defaultLabelInputValue });
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
    console.log(this.state.linkInputValue);
  }


  save() {
    if (this.props.onSave != null) {
      this.props.onSave(this.state.output);
    }

    this.hide();
  }

  inputChangeHandler(inputChangeValue) {
    this.setState({ linkInputValue: inputChangeValue });

  }

  submitHandler(submitValue) {
    this.setState({ linkInputValue: submitValue });
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
                  <PagePathAutoComplete
                    value={this.state.linkInputValue}
                    onInputChange={this.inputChangeHandler}
                    onSubmit={this.submitHandler}
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
                      <span className="p-2">[[{this.state.labelInputValue} &gt; {this.state.linkInputValue}]]</span>
                      <div className="form-inline">
                        <div className="custom-control custom-checkbox custom-checkbox-info">
                          <input className="custom-control-input" id="pukiwikiRelativePath" type="checkbox" checked={this.state.isUseRelativePath} />
                          <label className="custom-control-label" htmlFor="pukiwikiRelativePath" onClick={this.toggleIsUseRelativePath}>
                            Use relative path
                          </label>
                        </div>
                        <button type="button" className="btn btn-primary ml-auto" onClick={this.save}>
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
                        <button type="button" className="btn btn-primary ml-auto" onClick={this.save}>
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
                          <input className="custom-control-input" id="mdRelativePath" type="checkbox" checked={this.state.isUseRelativePath} />
                          <label className="custom-control-label" htmlFor="mdRelativePath" onClick={this.toggleIsUseRelativePath}>
                            Use relative path
                          </label>
                        </div>
                        <button type="button" className="btn btn-primary ml-auto" onClick={this.save}>
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

LinkEditModal.propTypes = {
  onSave: PropTypes.func,
};
