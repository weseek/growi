import React, { useCallback } from 'react';

import type { PageGrant, IGrantedGroup } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { useOnTemplateButtonClicked } from '~/client/services/use-on-template-button-clicked';
import { toastError } from '~/client/util/toastr';
import { TargetType, LabelType } from '~/interfaces/template';


type TemplateCardProps = {
  target: TargetType;
  label: LabelType;
  isPageCreating: boolean;
  onClickHandler: () => void;
};

const TemplateCard: React.FC<TemplateCardProps> = ({
  target, label, isPageCreating, onClickHandler,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card card-select-template">
      <div className="card-header">{t(`template.${target}.label`)}</div>
      <div className="card-body">
        <p className="text-center"><code>{label}</code></p>
        <p className="form-text text-muted text-center"><small>{t(`template.${target}.desc`)}</small></p>
      </div>
      <div className="card-footer text-center">
        <button
          disabled={isPageCreating}
          data-testid={`template-button-${target}`}
          className="btn btn-sm btn-primary"
          id={`template-button-${target}`}
          onClick={onClickHandler}
          type="button"
        >
          {t('Edit')}
        </button>
      </div>
    </div>
  );
};

type CreateTemplateModalProps = {
  path: string;
  isOpen: boolean;
  onClose: () => void;
  parentGrant?: PageGrant,
  parentGrantUserGroupIds?: IGrantedGroup[],
};

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  path, isOpen, onClose, parentGrant, parentGrantUserGroupIds,
}) => {
  const { t } = useTranslation();

  const { onClickHandler: onClickTemplateButton, isPageCreating } = useOnTemplateButtonClicked(path, undefined, parentGrant, parentGrantUserGroupIds);

  const onClickTemplateButtonHandler = useCallback(async(label: LabelType) => {
    try {
      await onClickTemplateButton(label);
    }
    catch (err) {
      toastError(err);
    }
  }, [onClickTemplateButton]);

  const parentPath = pathUtils.addTrailingSlash(path);

  const renderTemplateCard = (target: TargetType, label: LabelType) => (
    <div className="col">
      <TemplateCard
        target={target}
        label={label}
        isPageCreating={isPageCreating}
        onClickHandler={() => onClickTemplateButtonHandler(label)}
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} toggle={onClose} data-testid="page-template-modal">
      <ModalHeader tag="h4" toggle={onClose} className="bg-primary text-light">
        {t('template.modal_label.Create/Edit Template Page')}
      </ModalHeader>
      <ModalBody>
        <div>
          <label className="form-label mb-4">
            <code>{parentPath}</code><br />
            {t('template.modal_label.Create template under')}
          </label>
          <div className="row row-cols-2">
            {renderTemplateCard('children', '_template')}
            {renderTemplateCard('descendants', '__template')}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
