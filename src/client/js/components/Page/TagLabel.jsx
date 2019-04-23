import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';
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
    const tagStyle = {
      float: 'left',
      color: 'gray',
    };

    const tagListStyle = {
      border: 'none',
      fontSize: '10px',
      marginLeft: '5px',
    };

    const tagButtonStyle = {
      cursor: 'pointer',
      fontSize: '15px',
      marginLeft: '15px',
      marginRight: '10px',
      paddingTop: '1px',
      float: 'left',
    };


    const tagLinkStyle = {
      marginLeft: '2px',
      color: 'gray',
      fontSize: '10px',
    };

    for (let i = 0; i < this.state.currentPageTags.length; i++) {
      tags.push(
        <i style={tagListStyle} className="icon-tag"></i>,
        <a key={i.toString()} style={tagLinkStyle}>{this.state.currentPageTags[i]}</a>,
      );

    }

    return (
      <div style={tagStyle}>
        <i
          className="icon-wrench"
          style={tagButtonStyle}
          onClick={this.handleShowModal}
        >
        </i>
        {tags}
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
