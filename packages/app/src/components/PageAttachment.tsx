import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { useSWRxAttachments } from '~/stores/attachment';
import { useEditingMarkdown, useCurrentPageId, useIsGuestUser } from '~/stores/context';

import DeleteAttachmentModal from './PageAttachment/DeleteAttachmentModal';
import PageAttachmentList from './PageAttachment/PageAttachmentList';
import PaginationWrapper from './PaginationWrapper';

// Utility
const checkIfFileInUse = (markdown: string, attachment) => {
  return markdown.match(attachment._id);
};

// Custom hook that handles processes related to inUseAttachments
const useInUseAttachments = (attachments) => {
  const { data: markdown } = useEditingMarkdown();
  const [inUse, setInUse] = useState<any>({});

  // Update inUse when either of attachments or markdown is updated
  useEffect(() => {
    if (markdown == null) {
      return;
    }

    const newInUse = {};

    for (const attachment of attachments) {
      newInUse[attachment._id] = checkIfFileInUse(markdown, attachment);
    }

    setInUse(newInUse);
  }, [attachments, markdown]);

  return inUse;
};

const PageAttachment = (): JSX.Element => {
  const { t } = useTranslation();

  // Static SWRs
  const { data: pageId } = useCurrentPageId();
  const { data: isGuestUser } = useIsGuestUser();

  // States
  const [pageNumber, setPageNumber] = useState(1);
  const [attachmentToDelete, setAttachmentToDelete] = useState<any>(undefined);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // SWRs
  const { data: dataAttachments, remove } = useSWRxAttachments(pageId, pageNumber);
  const {
    attachments = [],
    totalAttachments = 0,
    limit,
  } = dataAttachments ?? {};

  // Custom hooks
  const inUseAttachments = useInUseAttachments(attachments);

  // Methods
  const onChangePageHandler = useCallback((newPageNumber: number) => {
    setPageNumber(newPageNumber);
  }, []);

  const onAttachmentDeleteClicked = useCallback((attachment) => {
    setAttachmentToDelete(attachment);
  }, []);

  const onAttachmentDeleteClickedConfirmHandler = useCallback(async(attachment) => {
    setDeleting(true);

    try {
      await remove({ attachment_id: attachment._id });

      setAttachmentToDelete(null);
      setDeleting(false);
    }
    catch {
      setDeleteError('Something went wrong.');
      setDeleting(false);
    }
  }, [remove]);

  const onToggleHandler = useCallback(() => {
    setAttachmentToDelete(null);
    setDeleteError('');
  }, []);

  // Renderers
  const renderDeleteAttachmentModal = useCallback(() => {
    if (isGuestUser) {
      return <></>;
    }

    if (attachments.length === 0) {
      return (
        <div data-testid="page-attachment">
          {t('No_attachments_yet')}
        </div>
      );
    }

    let deleteInUse = null;
    if (attachmentToDelete != null) {
      deleteInUse = inUseAttachments[attachmentToDelete._id] || false;
    }

    const isOpen = attachmentToDelete != null;

    return (
      <DeleteAttachmentModal
        isOpen={isOpen}
        animation="false"
        toggle={onToggleHandler}
        attachmentToDelete={attachmentToDelete}
        inUse={deleteInUse}
        deleting={deleting}
        deleteError={deleteError}
        onAttachmentDeleteClickedConfirm={onAttachmentDeleteClickedConfirmHandler}
      />
    );
  // eslint-disable-next-line max-len
  }, [attachmentToDelete, attachments.length, deleteError, deleting, inUseAttachments, isGuestUser, onAttachmentDeleteClickedConfirmHandler, onToggleHandler, t]);

  return (
    <div data-testid="page-attachment">
      <PageAttachmentList
        attachments={attachments}
        inUse={inUseAttachments}
        onAttachmentDeleteClicked={onAttachmentDeleteClicked}
        isUserLoggedIn={!isGuestUser}
      />

      {renderDeleteAttachmentModal()}

      <PaginationWrapper
        activePage={pageNumber}
        changePage={onChangePageHandler}
        totalItemsCount={totalAttachments}
        pagingLimit={limit}
        align="center"
      />
    </div>
  );
};

export default PageAttachment;
