import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import PageTagForm from '../PageTagForm';

import CopyButton from '../CopyButton';

export default class RevisionPath extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      pageTags: [],
      newPageTags: [],
      isListPage: false,
      isLinkToListPage: true,
      isOpenEditTagModal: false,
    };

    // retrieve xss library from window
    this.xss = window.xss;
    this.getPageTags = this.getPageTags.bind(this);
    this.updateTags = this.updateTags.bind(this);
    this.handleShowEditTagModal = this.handleShowEditTagModal.bind(this);
    this.handleCloseEditTagModal = this.handleCloseEditTagModal.bind(this);
    this.handleSubmitEditTagModal = this.handleSubmitEditTagModal.bind(this);
  }

  async componentWillMount() {
    // whether list page or not
    const isListPage = this.props.pagePath.match(/\/$/);
    this.setState({ isListPage });

    // whether set link to '/'
    const behaviorType = this.props.crowi.getConfig().behaviorType;
    const isLinkToListPage = (!behaviorType || behaviorType === 'crowi');
    this.setState({ isLinkToListPage });

    // generate pages obj
    const splitted = this.props.pagePath.split(/\//);
    splitted.shift(); // omit first element with shift()
    if (splitted[splitted.length - 1] === '') {
      splitted.pop(); // omit last element with unshift()
    }

    const pages = [];
    let parentPath = '/';
    splitted.forEach((pageName) => {
      pages.push({
        pagePath: parentPath + encodeURIComponent(pageName),
        pageName: this.xss.process(pageName),
      });
      parentPath += `${pageName}/`;
    });

    this.setState({ pages });

    // set pageTag on button
    if (this.props.pageId) {
      const pageTags = await this.getPageTags(this.props.pageId);
      this.setState({ pageTags });
    }
  }

  async getPageTags(pageId) {
    const res = await this.props.crowi.apiGet('/tags.get', { pageId });
    return res.tags;
  }

  updateTags(newPageTags) {
    this.setState({ newPageTags });
  }

  handleCloseEditTagModal() {
    this.setState({ isOpenEditTagModal: false });
  }

  handleShowEditTagModal() {
    this.setState({ isOpenEditTagModal: true });
  }

  async handleSubmitEditTagModal() {
    this.props.crowi.apiPost('/pages.updateTags', { pageId: this.props.pageId, newTags: this.state.newPageTags });
    const pageTags = await this.getPageTags(this.props.pageId);
    this.setState({ pageTags, isOpenEditTagModal: false });
  }

  showToolTip() {
    $('#btnCopy').tooltip('show');
    setTimeout(() => {
      $('#btnCopy').tooltip('hide');
    }, 1000);
  }

  generateLinkElementToListPage(pagePath, isLinkToListPage, isLastElement) {
    /* eslint-disable no-else-return */
    if (isLinkToListPage) {
      return <a href={`${pagePath}/`} className={(isLastElement && !this.state.isListPage) ? 'last-path' : ''}>/</a>;
    }
    else if (!isLastElement) {
      return <span>/</span>;
    }
    else {
      return <span></span>;
    }
    /* eslint-enable no-else-return */
  }

  render() {
    // define styles
    const rootStyle = {
      marginRight: '0.2em',
    };
    const separatorStyle = {
      marginLeft: '0.2em',
      marginRight: '0.2em',
    };
    const editButtonStyle = {
      marginLeft: '0.5em',
      padding: '0 2px',
    };
    const tagButtonStyle = {
      height: '19px',
      width: '20px',
      marginLeft: '0.5em',
      padding: '0 2px',
    };

    const pageLength = this.state.pages.length;

    const afterElements = [];
    this.state.pages.forEach((page, index) => {
      const isLastElement = (index === pageLength - 1);

      // add elements for page
      afterElements.push(
        <span key={page.pagePath} className="path-segment">
          <a href={page.pagePath}>{page.pageName}</a>
        </span>,
      );

      // add elements for '/'
      afterElements.push(
        <span key={`${page.pagePath}/`} className="separator" style={separatorStyle}>
          {this.generateLinkElementToListPage(page.pagePath, this.state.isLinkToListPage, isLastElement)}
        </span>,
      );
    });

    return (
      <span className="d-flex align-items-center">
        <span className="separator" style={rootStyle}>
          <a href="/">/</a>
        </span>
        {afterElements}
        <CopyButton
          buttonId="btnCopyRevisionPath"
          text={this.props.pagePath}
          buttonClassName="btn btn-default btn-copy"
          iconClassName="ti-clipboard"
        />
        <a href="#edit" className="btn btn-default btn-edit" style={editButtonStyle}>
          <i className="icon-note" />
        </a>
        <span className="btn-tag-container">
          <Button
            variant="primary"
            onClick={this.handleShowEditTagModal}
            className="btn btn-default btn-tag"
            style={tagButtonStyle}
            data-toggle="tooltip"
            data-placement="bottom"
            title={this.state.pageTags}
          >
            <i className="fa fa-tags"></i>
          </Button>
        </span>
        <Modal show={this.state.isOpenEditTagModal} onHide={this.handleCloseEditTagModal} id="editTagModal">
          <Modal.Header closeButton className="bg-primary">
            <Modal.Title className="text-white">ページタグ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PageTagForm crowi={this.props.crowi} defaultPageTags={this.state.pageTags} updateTags={this.updateTags} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleSubmitEditTagModal}>
              更新
            </Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }

}

RevisionPath.propTypes = {
  pageId: PropTypes.string,
  pagePath: PropTypes.string.isRequired,
  crowi: PropTypes.object.isRequired,
};
