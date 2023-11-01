import React, {
  useState, useCallback, useEffect, useMemo,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { apiPost } from '~/client/util/apiv1-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { useTagEditModal } from '~/stores/modal';

import { TagsInput } from './TagsInput';

export const TagEditModalSubstance: React.FC = () => {

  const { t } = useTranslation();

  const { data: tagEditModalData, close: closeTagEditModal } = useTagEditModal();

  const initTags = useMemo(() => {
    return tagEditModalData?.tags ?? [];
  }, [tagEditModalData?.tags]);

  const isOpen = tagEditModalData?.isOpen;
  const pageId = tagEditModalData?.pageId;
  const revisionId = tagEditModalData?.revisionId;
  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  const [tags, setTags] = useState<string[]>([]);

  // use to take initTags when redirect to other page
  useEffect(() => {
    setTags(initTags);
  }, [initTags]);

  const handleSubmit = useCallback(async() => {

    try {
      await apiPost('/tags.update', { pageId, revisionId, tags });
      updateStateAfterSave?.();

      toastSuccess('updated tags successfully');
      closeTagEditModal();
    }
    catch (err) {
      toastError(err);
    }
  }, [closeTagEditModal, tags, pageId, revisionId, updateStateAfterSave]);

  return (
    <Modal isOpen={isOpen} toggle={closeTagEditModal} id="edit-tag-modal" autoFocus={false}>
      <ModalHeader tag="h4" toggle={closeTagEditModal} className="bg-primary text-light">
        {t('tag_edit_modal.edit_tags')}
      </ModalHeader>
      <ModalBody>
        <TagsInput tags={initTags} onTagsUpdated={tags => setTags(tags)} autoFocus />
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          {t('tag_edit_modal.done')}
        </button>
      </ModalFooter>
    </Modal>
  );

};

export const TagEditModal: React.FC = () => {
  const { data: tagEditModalData } = useTagEditModal();
  const isOpen = tagEditModalData?.isOpen;

  if (!isOpen) {
    return <></>;
  }

  return <TagEditModalSubstance />;
};
