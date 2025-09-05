import React, {
  useState, useCallback, useEffect,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { apiPost } from '~/client/util/apiv1-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { useTagEditModal, type TagEditModalStatus } from '~/states/ui/modal/tag-edit';

import { TagsInput } from './TagsInput';

type TagEditModalSubstanceProps = {
  tagEditModalData: TagEditModalStatus,
  closeTagEditModal: () => void,
}

const TagEditModalSubstance: React.FC<TagEditModalSubstanceProps> = (props: TagEditModalSubstanceProps) => {
  const { tagEditModalData, closeTagEditModal } = props;
  const { t } = useTranslation();

  const initTags = tagEditModalData.tags;
  const isOpen = tagEditModalData.isOpen;
  const pageId = tagEditModalData.pageId;
  const revisionId = tagEditModalData.revisionId;
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
      <ModalHeader tag="h4" toggle={closeTagEditModal}>
        {t('tag_edit_modal.edit_tags')}
      </ModalHeader>
      <ModalBody>
        <TagsInput tags={initTags} onTagsUpdated={tags => setTags(tags)} autoFocus />
      </ModalBody>
      <ModalFooter>
        <button type="button" data-testid="tag-edit-done-btn" className="btn btn-primary" onClick={handleSubmit}>
          {t('tag_edit_modal.done')}
        </button>
      </ModalFooter>
    </Modal>
  );

};

export const TagEditModal: React.FC = () => {
  const { data: tagEditModalData, close: closeTagEditModal } = useTagEditModal();

  if (!tagEditModalData?.isOpen) {
    return <></>;
  }

  return <TagEditModalSubstance tagEditModalData={tagEditModalData} closeTagEditModal={closeTagEditModal} />;
};
