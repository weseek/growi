import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import * as toastr from 'toastr';
import PageTagForm from '../PageTagForm';

export default class EditTagModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pageTags: [],
      newPageTags: [],
      isOpenModal: false,
    };

    this.updateTags = this.updateTags.bind(this);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentWillMount() {
    // set pageTag on button
    if (this.props.pageId) {
      const pageId = this.props.pageId;
      const res = await this.props.crowi.apiGet('/tags.get', { pageId });
      this.setState({ pageTags: res.tags });
    }
  }

  updateTags(newPageTags) {
    this.setState({ newPageTags });
  }

  handleCloseModal() {
    this.setState({ isOpenModal: false });
  }

  handleShowModal() {
    this.setState({ isOpenModal: true });
  }

  handleSubmit() {
    try {
      this.props.crowi.apiPost('/pages.updateTags', { pageId: this.props.pageId, newTags: this.state.newPageTags });
      this.setState({ pageTags: this.state.newPageTags, isOpenModal: false });
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
        <Button
          variant="primary"
          onClick={this.handleShowModal}
          className="btn btn-default btn-tag"
          style={this.props.style}
          data-toggle="tooltip"
          data-placement="bottom"
          title={this.state.pageTags.map((tag) => {
            return `#${tag}`;
          })}
        >
          <i className="fa fa-tags"></i>{this.state.pageTags.length}
        </Button>
        <Modal show={this.state.isOpenModal} onHide={this.handleCloseModal} id="editTagModal">
          <Modal.Header closeButton className="bg-primary">
            <Modal.Title className="text-white">ページタグ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PageTagForm crowi={this.props.crowi} defaultPageTags={this.state.pageTags} updateTags={this.updateTags} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleSubmit} onSubmit={this.handleSubmit}>
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
