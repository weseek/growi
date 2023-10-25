import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { apiPost } from '~/client/util/apiv1-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { useTagEditModal } from '~/stores/modal';

import { TagsInput } from './TagsInput';

export const TagEditModal: React.FC = () => {

  const { t } = useTranslation();

  const { data: tagEditModalData, close: closeTagEditModal } = useTagEditModal();

  const isOpen = tagEditModalData?.isOpen;
  const initTags = tagEditModalData?.tags;
  const pageId = tagEditModalData?.pageId;
  const revisionId = tagEditModalData?.revisionId;
  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  const [tags, setTags] = useState<string[] | undefined>(initTags);
  const handleSubmit = useCallback(async(newTags?: string[]) => {

    try {
      await apiPost('/tags.update', { pageId, revisionId, tags: newTags });
      updateStateAfterSave?.();

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err);
    }
    closeTagEditModal();
  }, [closeTagEditModal, pageId, revisionId, updateStateAfterSave]);

  return (
    <Modal isOpen={isOpen} toggle={closeTagEditModal} id="edit-tag-modal" autoFocus={false}>
      <ModalHeader tag="h4" toggle={closeTagEditModal} className="bg-primary text-light">
        {t('tag_edit_modal.edit_tags')}
      </ModalHeader>
      <ModalBody>
        <TagsInput tags={initTags} onTagsUpdated={tags => setTags(tags)} autoFocus />
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={() => handleSubmit(tags)}>
          {t('tag_edit_modal.done')}
        </button>
      </ModalFooter>
    </Modal>
  );

};
