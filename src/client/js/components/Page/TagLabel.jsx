import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import PageTagForm from '../PageTagForm';

class TagLabel extends React.Component {

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
    // set default pageTag on button
    let tags = this.props.templateTags.split(',') || [];

    // tags of existed page override template tags
    const pageId = this.props.pageId;
    if (pageId) {
      const res = await this.props.crowi.apiGet('/pages.getPageTag', { pageId });
      tags = res.tags;
    }

    this.setState({ currentPageTags: tags });
    this.props.sendTagData(tags);
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
    const { t } = this.props;

    for (let i = 0; i < this.state.currentPageTags.length; i++) {
      tags.push(
        <i className="tag-icon icon-tag"></i>,
        <a className="tag-name text-muted" href={`/_search?q=tag:${this.state.currentPageTags[i]}`} key={i.toString()}>{this.state.currentPageTags[i]}</a>,
      );

    }

    return (
      <div className="tag-viewer text-muted">
        {this.state.currentPageTags.length === 0 && (
          <a className="display-of-notag text-muted" onClick={this.handleShowModal}>{ t('Add tags for this page') }</a>
        )}
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
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  sendTagData: PropTypes.func.isRequired,
  templateTags: PropTypes.string,
};

export default withTranslation()(TagLabel);
