import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';

import AppContainer from '../../services/AppContainer';

import TagsInput from './TagsInput';

export default class TagEditor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tags: [],
      isOpenModal: false,
    };

    this.show = this.show.bind(this);
    this.onTagsUpdatedByTagsInput = this.onTagsUpdatedByTagsInput.bind(this);
    this.closeModalHandler = this.closeModalHandler.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  show(tags) {
    // const isEditorMode = this.props.crowi.getCrowiForJquery().getCurrentEditorMode();
    this.setState({ tags, isOpenModal: true });
  }

  onTagsUpdatedByTagsInput(tags) {
    this.setState({ tags });
  }

  closeModalHandler() {
    this.setState({ isOpenModal: false });
  }

  async handleSubmit() {
    this.props.onTagsUpdated(this.state.tags);

    // close modal
    this.setState({ isOpenModal: false });
  }

  render() {
    return (
      <Modal show={this.state.isOpenModal} onHide={this.closeModalHandler} id="editTagModal">
        <Modal.Header closeButton className="bg-primary">
          <Modal.Title className="text-white">Edit Tags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TagsInput tags={this.state.tags} onTagsUpdated={this.onTagsUpdatedByTagsInput} />
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
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  onTagsUpdated: PropTypes.func.isRequired,
};
