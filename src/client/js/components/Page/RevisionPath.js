import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import Button from 'react-bootstrap/es/Button';
import PageTagForm from '../PageTagForm';

import CopyButton from '../CopyButton';

export default class RevisionPath extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      isListPage: false,
      isLinkToListPage: true,
      isEditTagModalOpen: false,
    };

    // retrieve xss library from window
    this.xss = window.xss;
    this.openEditTagModal = this.openEditTagModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeEditTagModal = this.closeEditTagModal.bind(this);
  }

  componentWillMount() {
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
  }

  openEditTagModal() {
    this.setState({ isEditTagModalOpen: true });
  }

  closeEditTagModal() {
    this.setState({ isEditTagModalOpen: false });
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
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
    const editTagModalStyle = {
      content: {
        top: '20%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        width: '720px',
        zIndex: '1060',
      },
      overlay: {
        zIndex: '1050',
        // backgroundColor: '#333333',
        // opacity: '0.5',
      },
    };

    Modal.setAppElement('.main-container');

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
            onClick={this.openEditTagModal}
            className="btn btn-default btn-tag"
            style={tagButtonStyle}
            data-toggle="tooltip"
            data-placement="bottom"
            title="#growi #wiki"
          ><i className="fa fa-tags"></i>
          </Button>
        </span>
        <Modal
          isOpen={this.state.isEditTagModalOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeEditTagModal}
          style={editTagModalStyle}
          contentLabel="edit tag modal"
        >
          <div className="modal-content" id="editTagModal">
            <div className="modal-header bg-primary">
              <div className="modal-title">ページタグを追加</div>
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={this.closeEditTagModal}>&times;</button>
            </div>
            <div className="modal-body">
              <PageTagForm crowi={this.props.crowi} defaultPageTags="[currentPageTags]" handleSubmit={console.log('###')} />
            </div>
            <div className="modal-footer">
              <div className="d-flex justify-content-between">
                <div className="float-right">
                  <button type="button" className="btn btn-primary">追加</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </span>
    );
  }

}

RevisionPath.propTypes = {
  pagePath: PropTypes.string.isRequired,
  crowi: PropTypes.object.isRequired,
};
