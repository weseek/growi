/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import PropTypes from 'prop-types';

import PageAttachmentList from './PageAttachment/PageAttachmentList';
import DeleteAttachmentModal from './PageAttachment/DeleteAttachmentModal';
import PaginationWrapper from './PaginationWrapper';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

class PageAttachment extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;
    this.showPages = this.showPages.bind(this);
    this.handlePage = this.handlePage.bind(this);

    this.state = {
      attachments: [],
      inUse: {},
      attachmentToDelete: null,
      deleting: false,
      deleteError: '',
      activePage: 1,
      totalPages: 0,
      limit: appContainer.getConfig().recentCreatedLimit,

    };

    this.onAttachmentDeleteClicked = this.onAttachmentDeleteClicked.bind(this);
    this.onAttachmentDeleteClickedConfirm = this.onAttachmentDeleteClickedConfirm.bind(this);
  }

  // componentWillMount() {
  //   this.showPages(1);
  // }

  componentDidMount() {
    const { pageId } = this.props.pageContainer.state;

    if (!pageId) {
      return;
    }

    this.props.appContainer.apiGet('/attachments.list', { page_id: pageId })
      .then((res) => {
        const attachments = res.attachments;
        const inUse = {};

        for (const attachment of attachments) {
          inUse[attachment._id] = this.checkIfFileInUse(attachment);
        }

        this.setState({
          attachments,
          inUse,
        });
      });
  }

  async handlePage(selectedPage) {
    await this.showPages(selectedPage);
  }

  async showPages(selectedPage) {
    const { appContainer, pageContainer } = this.props;
    const { path } = pageContainer.state;
    const limit = this.state.limit;
    const offset = (selectedPage - 1) * limit;
    const res = await appContainer.apiv3Get('/pages/list', { path, limit, offset });
    const activePage = selectedPage;
    const totalPages = res.data.totalCount;
    this.setState({
      activePage,
      totalPages,
    });
  }

  checkIfFileInUse(attachment) {
    const { markdown } = this.props.pageContainer.state;

    if (markdown.match(attachment._id)) {
      return true;
    }
    return false;
  }

  onAttachmentDeleteClicked(attachment) {
    this.setState({
      attachmentToDelete: attachment,
    });
  }

  onAttachmentDeleteClickedConfirm(attachment) {
    const attachmentId = attachment._id;
    this.setState({
      deleting: true,
    });

    this.props.appContainer.apiPost('/attachments.remove', { attachment_id: attachmentId })
      .then((res) => {
        this.setState({
          attachments: this.state.attachments.filter((at) => {
            // comparing ObjectId
            // eslint-disable-next-line eqeqeq
            return at._id != attachmentId;
          }),
          attachmentToDelete: null,
          deleting: false,
        });
      }).catch((err) => {
        this.setState({
          deleteError: 'Something went wrong.',
          deleting: false,
        });
      });
  }

  isUserLoggedIn() {
    return this.props.appContainer.currentUser != null;
  }

  render() {
    let deleteAttachmentModal = '';
    if (this.isUserLoggedIn()) {
      const attachmentToDelete = this.state.attachmentToDelete;
      const deleteModalClose = () => {
        this.setState({ attachmentToDelete: null, deleteError: '' });
      };
      const showModal = attachmentToDelete !== null;

      let deleteInUse = null;
      if (attachmentToDelete !== null) {
        deleteInUse = this.state.inUse[attachmentToDelete._id] || false;
      }

      deleteAttachmentModal = (
        <DeleteAttachmentModal
          isOpen={showModal}
          animation={false}
          toggle={deleteModalClose}

          attachmentToDelete={attachmentToDelete}
          inUse={deleteInUse}
          deleting={this.state.deleting}
          deleteError={this.state.deleteError}
          onAttachmentDeleteClickedConfirm={this.onAttachmentDeleteClickedConfirm}
        />
      );
    }


    return (
      <div>
        <PageAttachmentList
          attachments={this.state.attachments}
          inUse={this.state.inUse}
          onAttachmentDeleteClicked={this.onAttachmentDeleteClicked}
          isUserLoggedIn={this.isUserLoggedIn()}
        />

        {deleteAttachmentModal}

        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemCount={this.state.totalPages}
          pagingLimit={this.state.limit}
        />
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PageAttachmentWrapper = withUnstatedContainers(PageAttachment, [AppContainer, PageContainer]);


PageAttachment.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default PageAttachmentWrapper;
