import React, { VFC, useState, useEffect } from 'react';

import { PaginationWrapper } from '~/components/PaginationWrapper';

import PageAttachmentList from '../../client/js/components/PageAttachment/PageAttachmentList';
import DeleteAttachmentModal from '../../client/js/components/PageAttachment/DeleteAttachmentModal';
import { useCurrentPageAttachment } from '~/stores/page';
import { Attachment } from '~/interfaces/page';

export const PageAttachment:VFC = () => {
  const inUse = {};

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [limit, setLimit] = useState(Infinity);

  const { data: paginationResult } = useCurrentPageAttachment(activePage);

  useEffect(() => {
    if (paginationResult == null) {
      return;
    }
    setTotalItemsCount(paginationResult.totalDocs);
    setLimit(paginationResult.limit);
    setAttachments(paginationResult.docs);
  }, [paginationResult]);

  return (
    <PageAttachmentList
      attachments={attachments}
      inUse={inUse}
      // onAttachmentDeleteClicked={onAttachmentDeleteClicked}
      // isUserLoggedIn={isUserLoggedIn}
    />

  );

};

//     this.state = {
//       activePage: 1,
//       totalAttachments: 0,
//       limit: Infinity,
//       attachments: [],
//       inUse: {},
//       attachmentToDelete: null,
//       deleting: false,
//       deleteError: '',
//     };

//   }


//   const handlePage=(selectedPage)=> {
//     const { pageId } = this.props.pageContainer.state;
//     const page = selectedPage;

//     if (!pageId) { return }

//     const res = await apiv3Get('/attachment/list', { pageId, page });
//     const attachments = res.data.paginateResult.docs;
//     const totalAttachments = res.data.paginateResult.totalDocs;
//     const pagingLimit = res.data.paginateResult.limit;

//     const inUse = {};

//     for (const attachment of attachments) {
//       inUse[attachment._id] = this.checkIfFileInUse(attachment);
//     }
//     this.setState({
//       activePage: selectedPage,
//       totalAttachments,
//       limit: pagingLimit,
//       attachments,
//       inUse,
//     });
//   }


//   async componentDidMount() {
//     await this.handlePage(1);
//     this.setState({
//       activePage: 1,
//     });
//   }

//   checkIfFileInUse(attachment) {
//     const { markdown } = this.props.pageContainer.state;

//     if (markdown.match(attachment._id)) {
//       return true;
//     }
//     return false;
//   }

//   onAttachmentDeleteClicked(attachment) {
//     this.setState({
//       attachmentToDelete: attachment,
//     });
//   }

//   onAttachmentDeleteClickedConfirm(attachment) {
//     const attachmentId = attachment._id;
//     this.setState({
//       deleting: true,
//     });

//     apiPost('/attachments.remove', { attachment_id: attachmentId })
//       .then((res) => {
//         this.setState({
//           attachments: this.state.attachments.filter((at) => {
//             // comparing ObjectId
//             // eslint-disable-next-line eqeqeq
//             return at._id != attachmentId;
//           }),
//           attachmentToDelete: null,
//           deleting: false,
//         });
//       }).catch((err) => {
//         this.setState({
//           deleteError: 'Something went wrong.',
//           deleting: false,
//         });
//       });
//   }

//   isUserLoggedIn() {
//     // TODO retrieve from useCurrentUser at context.tsx
//     const currentUser = null;
//     return currentUser != null;
//   }


//   render() {
//     const { t } = this.props;
//     if (this.state.attachments.length === 0) {
//       return t('No_attachments_yet');
//     }

//     let deleteAttachmentModal = '';
//     if (this.isUserLoggedIn()) {
//       const attachmentToDelete = this.state.attachmentToDelete;
//       const deleteModalClose = () => {
//         this.setState({ attachmentToDelete: null, deleteError: '' });
//       };
//       const showModal = attachmentToDelete !== null;

//       let deleteInUse = null;
//       if (attachmentToDelete !== null) {
//         deleteInUse = this.state.inUse[attachmentToDelete._id] || false;
//       }

//       deleteAttachmentModal = (
//         <DeleteAttachmentModal
//           isOpen={showModal}
//           animation="false"
//           toggle={deleteModalClose}

//           attachmentToDelete={attachmentToDelete}
//           inUse={deleteInUse}
//           deleting={this.state.deleting}
//           deleteError={this.state.deleteError}
//           onAttachmentDeleteClickedConfirm={this.onAttachmentDeleteClickedConfirm}
//         />
//       );
//     }

//     return (
//       <>
//         <PageAttachmentList
//           attachments={this.state.attachments}
//           inUse={this.state.inUse}
//           onAttachmentDeleteClicked={this.onAttachmentDeleteClicked}
//           isUserLoggedIn={this.isUserLoggedIn()}
//         />

//         {deleteAttachmentModal}

//         <PaginationWrapper
//           activePage={this.state.activePage}
//           changePage={this.handlePage}
//           totalItemsCount={this.state.totalAttachments}
//           pagingLimit={this.state.limit}
//           align="center"
//         />
//       </>
//     );
//   }

// }
