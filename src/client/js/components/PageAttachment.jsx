/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import PropTypes from 'prop-types';

import PageAttachmentList from './PageAttachment/PageAttachmentList';
import DeleteAttachmentModal from './PageAttachment/DeleteAttachmentModal';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

class PageAttachment extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;
    this.state = {
      attachments: [],
      inUse: {},
      attachmentToDelete: null,
      deleting: false,
      deleteError: '',
      limit: appContainer.getConfig().recentCreatedLimit,
      offset: 0,
    };

    this.onAttachmentDeleteClicked = this.onAttachmentDeleteClicked.bind(this);
    this.onAttachmentDeleteClickedConfirm = this.onAttachmentDeleteClickedConfirm.bind(this);
  }

  async componentDidMount() {
    const { pageId } = this.props.pageContainer.state;
    const { limit, offset } = this.state;

    if (!pageId) {
      return;
    }

    await this.props.appContainer.apiv3Get('/attachments/list', { pageId, limit, offset })
      .then((res) => {
        const attachments = res.data.attachments;
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
