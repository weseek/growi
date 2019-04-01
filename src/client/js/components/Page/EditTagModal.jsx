import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
import Tooltip from 'react-bootstrap/es/Tooltip';
import Modal from 'react-bootstrap/es/Modal';
import PageTagForm from '../PageTagForm';

/**
 * show tag labels on view and edit tag button on edit
 * tag labels on view is not implemented yet(GC-1391)
 */
export default class EditTagModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      newPageTags: [],
      isOpenModal: false,
    };

    this.addNewTag = this.addNewTag.bind(this);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // receive new tag from PageTagForm component
  addNewTag(newPageTags) {
    this.setState({ newPageTags });
  }

  handleCloseModal() {
    this.setState({ isOpenModal: false });
  }

  handleShowModal() {
    this.setState({ isOpenModal: true });
  }

  handleSubmit() {
    this.props.sendTagData(this.state.newPageTags);
    this.setState({ isOpenModal: false });
  }

  render() {
    const tagEditorButtonStyle = {
      marginLeft: '0.2em',
      padding: '0 2px',
    };

    return (
      <span className="btn-tag-container">
        <OverlayTrigger
          key="tooltip"
          placement="bottom"
          overlay={(
            <Tooltip id="tag-edit-button-tooltip" className="tag-tooltip">
              {this.props.currentPageTags.length !== 0 ? this.props.currentPageTags.join() : 'tag is not set' }
            </Tooltip>
          )}
        >
          <Button
            variant="primary"
            onClick={this.handleShowModal}
            className="btn btn-default btn-tag"
            style={tagEditorButtonStyle}
          >
            <i className="fa fa-tags"></i>{this.props.currentPageTags.length}
          </Button>
        </OverlayTrigger>
        <Modal show={this.state.isOpenModal} onHide={this.handleCloseModal} id="editTagModal">
          <Modal.Header closeButton className="bg-primary">
            <Modal.Title className="text-white">Page Tag</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PageTagForm crowi={this.props.crowi} currentPageTags={this.props.currentPageTags} addNewTag={this.addNewTag} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleSubmit}>
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }

}

EditTagModal.propTypes = {
  crowi: PropTypes.object.isRequired,
  currentPageTags: PropTypes.array,
  sendTagData: PropTypes.func,
};
