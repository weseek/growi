import React from 'react';
import PropTypes from 'prop-types';
import * as toastr from 'toastr';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import TagsInput from './TagsInput';

class TagEditor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tags: [],
      isOpenModal: false,
      isEditorMode: null,
    };

    this.show = this.show.bind(this);
    this.onTagsUpdatedByFormHandler = this.onTagsUpdatedByFormHandler.bind(this);
    this.closeModalHandler = this.closeModalHandler.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.apiSuccessHandler = this.apiSuccessHandler.bind(this);
    this.apiErrorHandler = this.apiErrorHandler.bind(this);
  }

  async componentWillMount() {
  }

  show(tags) {
    const isEditorMode = this.props.crowi.getCrowiForJquery().getCurrentEditorMode();
    this.setState({ isOpenModal: true, isEditorMode, tags });
  }

  onTagsUpdatedByFormHandler(tags) {
    this.setState({ tags });
  }

  closeModalHandler() {
    this.setState({ isOpenModal: false });
  }

  async handleSubmit() {

    if (!this.state.isEditorMode) {
      try {
        await this.props.crowi.apiPost('/tags.update', { pageId: this.props.pageId, tags: this.state.tags });
        this.apiSuccessHandler();
      }
      catch (err) {
        this.apiErrorHandler(err);
        return;
      }
    }

    this.props.onTagsUpdated(this.state.tags);

    // close modal
    this.setState({ isOpenModal: false });
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
    return (
      <Modal show={this.state.isOpenModal} onHide={this.closeModalHandler} id="editTagModal">
        <Modal.Header closeButton className="bg-primary">
          <Modal.Title className="text-white">Edit Tags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TagsInput crowi={this.props.crowi} tags={this.state.tags} onTagsUpdated={this.onTagsUpdatedByFormHandler} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.handleSubmit}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

}

TagEditor.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  onTagsUpdated: PropTypes.func.isRequired,
};

export default TagEditor;
