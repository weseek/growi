import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import PageTagForm from '../PageTagForm';

export default class TagLabel extends React.Component {

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
      const res = await this.props.crowi.apiGet('/pages.getPageTag', { pageId });
      this.setState({ currentPageTags: res.tags });
      this.props.sendTagData(res.tags);
    }
  }

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
    this.setState({ currentPageTags: this.state.newPageTags, isOpenModal: false });
  }

  render() {
    const tags = [];

    for (let i = 0; i < this.state.currentPageTags.length; i++) {
      tags.push(
        <i className="tag-icon icon-tag"></i>,
        <a key={i.toString()}>{this.state.currentPageTags[i]}</a>,
      );

    }

    return (
      <div className="tag-viewer">
        {tags}
        <i
          className="manage-tags icon-plus"
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
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  sendTagData: PropTypes.func.isRequired,
};
