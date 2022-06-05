/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import PageContainer from '~/client/services/PageContainer';
import { apiPost } from '~/client/util/apiv1-client';
import { apiv3Get } from '~/client/util/apiv3-client';
import { useIsGuestUser } from '~/stores/context';

import DeleteAttachmentModal from './PageAttachment/DeleteAttachmentModal';
import PageAttachmentList from './PageAttachment/PageAttachmentList';
import PaginationWrapper from './PaginationWrapper';
import { withUnstatedContainers } from './UnstatedUtils';


class PageAttachment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activePage: 1,
      totalAttachments: 0,
      limit: Infinity,
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

    const res = await apiv3Get('/attachment/list', { pageId, page });
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

    apiPost('/attachments.remove', { attachment_id: attachmentId })
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


  render() {
    const { t, isGuestUser } = this.props;

    if (this.state.attachments.length === 0) {
      return (
        <div data-testid="page-attachment">
          {t('No_attachments_yet')}
        </div>
      );
    }

    let deleteAttachmentModal = '';
    if (!isGuestUser) {
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
      <div data-testid="page-attachment">
        <PageAttachmentList
          attachments={this.state.attachments}
          inUse={this.state.inUse}
          onAttachmentDeleteClicked={this.onAttachmentDeleteClicked}
          isUserLoggedIn={!isGuestUser}
        />

        {deleteAttachmentModal}

        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalAttachments}
          pagingLimit={this.state.limit}
          align="center"
        />
      </div>
    );
  }

}

PageAttachment.propTypes = {
  t: PropTypes.func.isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isGuestUser: PropTypes.bool.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const PageAttachmentUnstatedWrapper = withUnstatedContainers(PageAttachment, [PageContainer]);

const PageAttachmentWrapper = (props) => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();

  if (isGuestUser == null) {
    return <></>;
  }

  return <PageAttachmentUnstatedWrapper {...props} t={t} isGuestUser={isGuestUser} />;
};

export default PageAttachmentWrapper;
