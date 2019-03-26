import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
import Tooltip from 'react-bootstrap/es/Tooltip';
import Modal from 'react-bootstrap/es/Modal';
import * as toastr from 'toastr';
import PageTagForm from '../PageTagForm';

export default class EditTagModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentPageTags: [],
      newPageTags: [],
      isOpenModal: false,
    };

    this.addNewTag = this.addNewTag.bind(this);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentWillMount() {
    // set pageTag on button
    const pageId = this.props.pageId;
    if (pageId) {
      const res = await this.props.crowi.apiGet('/tags.get', { pageId });
      this.setState({ currentPageTags: res.tags });
    }
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

  async handleSubmit() {
    try {
      const res = await this.props.crowi.apiPost('/pages.updateTags', { pageId: this.props.pageId, newPageTags: this.state.newPageTags });
      this.setState({ currentPageTags: res.nextTags, isOpenModal: false });
      toastr.success(undefined, 'Updated tags successfully', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });
    }
    catch (err) {
      toastr.error(err, 'Error occured on updating tags', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '3000',
      });
    }
  }

  render() {
    return (
      <span className="btn-tag-container">
        <OverlayTrigger
          key="tooltip"
          placement="bottom"
          overlay={(
            <Tooltip id="tooltip-bottom">
              {this.state.currentPageTags.length !== 0 ? this.state.currentPageTags.join() : 'tag is not set' }
            </Tooltip>
          )}
        >
          <Button
            variant="primary"
            onClick={this.handleShowModal}
            className="btn btn-default btn-tag"
            style={this.props.style}
          >
            <i className="fa fa-tags"></i>{this.state.currentPageTags.length}
          </Button>
        </OverlayTrigger>
        <Modal show={this.state.isOpenModal} onHide={this.handleCloseModal} id="editTagModal">
          <Modal.Header closeButton className="bg-primary">
            <Modal.Title className="text-white">ページタグ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PageTagForm crowi={this.props.crowi} currentPageTags={this.state.currentPageTags} addNewTag={this.addNewTag} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleSubmit}>
              更新
            </Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }

}

EditTagModal.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  style: PropTypes.object,
};
