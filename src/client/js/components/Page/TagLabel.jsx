import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import PageTagForm from '../PageTagForm';

class TagLabel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentPageTags: [],
      newPageTags: [],
      isOpenModal: false,
      isEditorMode: null,
    };

    this.addNewTag = this.addNewTag.bind(this);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.apiSuccessHandler = this.apiSuccessHandler.bind(this);
    this.apiErrorHandler = this.apiErrorHandler.bind(this);
  }

  async componentWillMount() {
    // set pageTag on button
    const pageId = this.props.pageId;
    if (pageId) {
      const res = await this.props.crowi.apiGet('/pages.getPageTag', { pageId });
      this.setState({ currentPageTags: res.tags, newPageTags: res.tags });
      this.props.sendTagData(res.tags);
    }
  }

  addNewTag(newPageTags) {
    this.setState({ newPageTags });
  }

  handleCloseModal() {
    // reset state newPageTags when user close modal without push Done button
    this.setState({ isOpenModal: false, newPageTags: this.state.currentPageTags });
  }

  handleShowModal() {
    const isEditorMode = this.props.crowi.getCrowiForJquery().getCurrentEditorMode();
    this.setState({ isOpenModal: true, isEditorMode });
  }

  async handleSubmit() {

    if (this.state.isEditorMode) { // set tag on draft on edit
      this.props.sendTagData(this.state.newPageTags);
    }
    else { // update tags without saving the page on view
      try {
        await this.props.crowi.apiPost('/tags.update', { pageId: this.props.pageId, tags: this.state.newPageTags });
        this.apiSuccessHandler();
      }
      catch (err) {
        this.apiErrorHandler(err);
        return;
      }
    }
    this.setState({ currentPageTags: this.state.newPageTags, isOpenModal: false });
  }

  apiSuccessHandler() {
    toastr.success(undefined, 'updated tags successfully', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '1200',
      extendedTimeOut: '150',
    });
  }

  apiErrorHandler(err) {
    toastr.error(err.message, 'Error occured', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  }

  render() {
    const tags = [];
    const { t } = this.props;

    for (let i = 0; i < this.state.currentPageTags.length; i++) {
      tags.push(
        <i className="tag-icon icon-tag"></i>,
        <a className="tag-name text-muted" href={`/_search?q=tag:${this.state.currentPageTags[i]}`} key={i.toString()}>{this.state.currentPageTags[i]}</a>,
      );

    }

    return (
      <div className="tag-viewer text-muted">
        {this.state.currentPageTags.length === 0 && (
          <a className="display-of-notag text-muted" onClick={this.handleShowModal}>{ t('Add tags for this page') }</a>
        )}
        {tags}
        <i
          className="manage-tags ml-2 icon-plus"
          onClick={this.handleShowModal}

        >
        </i>
        <Modal show={this.state.isOpenModal} onHide={this.handleCloseModal} id="editTagModal">
          <Modal.Header closeButton className="bg-primary">
            <Modal.Title className="text-white">Page Tag</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PageTagForm crowi={this.props.crowi} currentPageTags={this.state.currentPageTags} addNewTag={this.addNewTag} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleSubmit}>
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

}

TagLabel.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  sendTagData: PropTypes.func.isRequired,
};

export default withTranslation()(TagLabel);
