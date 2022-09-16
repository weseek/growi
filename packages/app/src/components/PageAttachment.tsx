import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import { useSWRxAttachments } from '~/stores/attachment';
import { useEditingMarkdown, useCurrentPageId, useIsGuestUser } from '~/stores/context';

import DeleteAttachmentModal from './PageAttachment/DeleteAttachmentModal';
import PageAttachmentList from './PageAttachment/PageAttachmentList';
import PaginationWrapper from './PaginationWrapper';

// Utility
const checkIfFileInUse = (markdown: string, attachment): boolean => {
  return markdown.indexOf(attachment._id) >= 0;
};

const PageAttachment = (): JSX.Element => {
  const { t } = useTranslation();

  // Static SWRs
  const { data: pageId } = useCurrentPageId();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: markdown } = useEditingMarkdown();

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
  const inUseAttachmentsMap: { [id: string]: boolean } = useMemo(() => {
    if (markdown == null) {
      return {};
    }

    const attachmentEntries = attachments
      .map((attachment) => {
        return [attachment._id, checkIfFileInUse(markdown, attachment)];
      });

    return Object.fromEntries(attachmentEntries);
  }, [attachments, markdown]);

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

    let deleteInUse: boolean | null = null;
    if (attachmentToDelete != null) {
      deleteInUse = inUseAttachmentsMap[attachmentToDelete._id] || false;
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
  }, [attachmentToDelete, attachments.length, deleteError, deleting, inUseAttachmentsMap, isGuestUser, onAttachmentDeleteClickedConfirmHandler, onToggleHandler, t]);

  return (
    <div data-testid="page-attachment">
      <PageAttachmentList
        attachments={attachments}
        inUse={inUseAttachmentsMap}
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
