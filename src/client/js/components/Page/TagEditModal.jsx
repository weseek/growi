import React from 'react';
import PropTypes from 'prop-types';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import AppContainer from '../../services/AppContainer';

import TagsInput from './TagsInput';

export default class TagEditModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tags: [],
    };

    this.onTagsUpdatedByTagsInput = this.onTagsUpdatedByTagsInput.bind(this);
    this.closeModalHandler = this.closeModalHandler.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onTagsUpdatedByTagsInput(tags) {
    this.setState({ tags });
  }

  closeModalHandler() {
    if (this.props.onClose == null) {
      return;
    }
    this.props.onClose();
  }

  async handleSubmit() {
    this.props.onTagsUpdated(this.state.tags);
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.closeModalHandler} id="edit-tag-modal">
        <ModalHeader tag="h4" toggle={this.closeModalHandler} className="bg-primary text-light">
          Edit Tags
        </ModalHeader>
        <ModalBody>
          <TagsInput tags={this.state.tags} onTagsUpdated={this.onTagsUpdatedByTagsInput} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.handleSubmit}>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

}

TagEditModal.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onTagsUpdated: PropTypes.func.isRequired,
};
