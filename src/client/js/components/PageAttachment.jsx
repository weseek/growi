/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PageAttachmentList from './PageAttachment/PageAttachmentList';
import DeleteAttachmentModal from './PageAttachment/DeleteAttachmentModal';
import PaginationWrapper from './PaginationWrapper';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

class PageAttachment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activePage: 1,
      totalAttachments: 0,
      limit: null,
      attachments: [],
      inUse: {},
      attachmentToDelete: null,
      deleting: false,
      deleteError: '',
    };

    this.handlePage = this.handlePage.bind(this);
    this.onAttachmentDeleteClicked = this.onAttachmentDeleteClicked.bind(this);
    this.onAttachmentDeleteClickedConfirm = this.onAttachmentDeleteClickedConfirm.bind(this);
  }


  async handlePage(selectedPage) {
    const { pageId } = this.props.pageContainer.state;
    const page = selectedPage;

    if (!pageId) { return }

    const res = await this.props.appContainer.apiv3Get('/attachment/list', { pageId, page });
    const attachments = res.data.paginateResult.docs;
    const totalAttachments = res.data.paginateResult.totalDocs;
    const pagingLimit = res.data.paginateResult.limit;

    const inUse = {};

    for (const attachment of attachments) {
      inUse[attachment._id] = this.checkIfFileInUse(attachment);
    }
    this.setState({
      activePage: selectedPage,
      totalAttachments,
      limit: pagingLimit,
      attachments,
      inUse,
    });
  }


  async componentDidMount() {
    await this.handlePage(1);
    this.setState({
      activePage: 1,
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
    const { t } = this.props;
    if (this.state.attachments.length === 0) {
      return t('No_attachments_yet');
    }

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
          animation="false"
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
      <>
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
          totalItemsCount={this.state.totalAttachments}
          pagingLimit={this.state.limit}
          align="center"
        />
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PageAttachmentWrapper = withUnstatedContainers(PageAttachment, [AppContainer, PageContainer]);


PageAttachment.propTypes = {
  t: PropTypes.func.isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageAttachmentWrapper);
