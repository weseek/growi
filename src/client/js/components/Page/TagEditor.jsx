import React from 'react';
import PropTypes from 'prop-types';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

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
      <Modal isOpen={this.state.isOpenModal} toggle={this.closeModalHandler} id="editTagModal">
        <ModalHeader closeButton className="bg-primary">
          <span className="text-white">Edit Tags</span>
        </ModalHeader>
        <ModalBody>
          <TagsInput tags={this.state.tags} onTagsUpdated={this.onTagsUpdatedByTagsInput} />
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={this.handleSubmit}>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

}

TagEditor.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  onTagsUpdated: PropTypes.func.isRequired,
};
