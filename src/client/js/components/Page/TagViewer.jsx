import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
import Tooltip from 'react-bootstrap/es/Tooltip';
import Modal from 'react-bootstrap/es/Modal';
import PageTagForm from '../PageTagForm';

export default class TagViewer extends React.Component {

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

  handleSubmit() {
    this.props.sendTagData(this.state.newPageTags);
    this.setState({ currentPageTags: this.state.newPageTags, isOpenModal: false });
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
            <Tooltip id="tag-tooltip" className="tooltip">
              {this.state.currentPageTags.length !== 0 ? this.state.currentPageTags.join() : 'tag is not set' }
            </Tooltip>
          )}
        >
          <Button
            variant="primary"
            onClick={this.handleShowModal}
            className="btn btn-default btn-tag"
            style={tagEditorButtonStyle}
          >
            <i className="fa fa-tags"></i>{this.state.currentPageTags.length}
          </Button>
        </OverlayTrigger>
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
      </span>
    );
  }

}

TagViewer.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  sendTagData: PropTypes.func,
};
