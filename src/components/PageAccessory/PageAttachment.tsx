import {
  VFC, useState, useEffect, useCallback,
} from 'react';

import { useCurrentPageAttachment, useCurrentPageSWR } from '~/stores/page';
import { useCurrentUser } from '~/stores/context';

import { Attachment as IAttachment } from '~/interfaces/page';
import { useTranslation } from '~/i18n';

import { PaginationWrapper } from '~/components/PaginationWrapper';
import { Attachment } from '~/components/PageAccessory/Attachment';
import { DeleteAttachmentModal } from '~/components/PageAccessory/DeleteAttachmentModal';


export const PageAttachment:VFC = () => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const [inUseByAttachmentId, setInUseByAttachmentId] = useState<{ [key:string]:boolean }>({});
  const [attachments, setAttachments] = useState<IAttachment[]>([]);

  const [isOpenDeleteAttachmentModal, setIsOpenDeleteAttachmentModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<IAttachment>();

  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [limit, setLimit] = useState(Infinity);

  const { data: currentPage } = useCurrentPageSWR();
  const { data: paginationResult } = useCurrentPageAttachment(activePage);

  const handlePage = useCallback(async(selectedPage) => {
    setActivePage(selectedPage);
  }, []);

  useEffect(() => {
    if (paginationResult == null) {
      return;
    }
    setTotalItemsCount(paginationResult.totalDocs);
    setLimit(paginationResult.limit);
    setAttachments(paginationResult.docs);
  }, [paginationResult]);

  const checkIfFileInUse = useCallback((attachment) => {
    if (currentPage?.revision.body.match(attachment._id)) {
      return true;
    }
    return false;
  }, [currentPage]);

  useEffect(() => {
    const inUseByAttachmentId: { [key:string]:boolean } = {};
    for (const attachment of attachments) {
      inUseByAttachmentId[attachment._id] = checkIfFileInUse(attachment);
    }
    setInUseByAttachmentId(inUseByAttachmentId);
  }, [attachments, checkIfFileInUse]);

  const onAttachmentDeleteClicked = useCallback((attachment:IAttachment) => {
    setIsOpenDeleteAttachmentModal(true);
    setAttachmentToDelete(attachment);
  }, []);

  if (paginationResult == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="mt-2">
        <p>{t('No_attachments_yet')}</p>
      </div>
    );
  }

  return (
    <>
      {attachments.map((attachment) => {
        return (
          <Attachment
            key={`page:attachment:${attachment._id}`}
            attachment={attachment}
            inUse={inUseByAttachmentId[attachment._id]}
            isUserLoggedIn={currentUser != null}
            onAttachmentDeleteClicked={onAttachmentDeleteClicked}
          />
        );
      })}
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalItemsCount}
        pagingLimit={limit}
        align="center"
      />
      {attachmentToDelete && (
        <DeleteAttachmentModal
          isOpen={isOpenDeleteAttachmentModal}
          onClose={() => (setIsOpenDeleteAttachmentModal(false))}
          attachmentToDelete={attachmentToDelete}
          activePage={activePage}
        />
      )}
    </>
  );

};
