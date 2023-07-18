import React, { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalBody, ModalHeader,
} from 'reactstrap';

import {
  useDisableLinkSharing, useIsGuestUser, useIsReadOnlyUser, useIsSharedUser,
} from '~/stores/context';
import { usePageAccessoriesModal, PageAccessoriesModalContents } from '~/stores/modal';

import { CustomNavTab } from '../CustomNavigation/CustomNav';
import CustomTabContent from '../CustomNavigation/CustomTabContent';
import ExpandOrContractButton from '../ExpandOrContractButton';
import AttachmentIcon from '../Icons/AttachmentIcon';
import HistoryIcon from '../Icons/HistoryIcon';
import ShareLinkIcon from '../Icons/ShareLinkIcon';
import PageAttachment from '../PageAttachment';
import { PageHistory, getQueryParam } from '../PageHistory';
import ShareLink from '../ShareLink/ShareLink';

import { useOpenModalByQueryParam } from './open-modal-by-query-param';

import styles from './PageAccessoriesModal.module.scss';

export const PageAccessoriesModal = (): JSX.Element => {

  const { t } = useTranslation();

  const [sourceRevisionId, setSourceRevisionId] = useState<string>();
  const [targetRevisionId, setTargetRevisionId] = useState<string>();

  const [isWindowExpanded, setIsWindowExpanded] = useState(false);

  const { data: isSharedUser } = useIsSharedUser();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: isLinkSharingDisabled } = useDisableLinkSharing();

  const { data: status, close, selectContents } = usePageAccessoriesModal();

  useOpenModalByQueryParam();

  // Set sourceRevisionId and targetRevisionId as state with valid object id string
  useEffect(() => {
    const queryParams = getQueryParam();
    // https://regex101.com/r/YHTDsr/1
    const regex = /^([0-9a-f]{24})...([0-9a-f]{24})$/i;

    if (queryParams == null || !regex.test(queryParams)) {
      return;
    }

    const matches = queryParams.match(regex);

    if (matches == null) {
      return;
    }

    const [, sourceRevisionId, targetRevisionId] = matches;
    setSourceRevisionId(sourceRevisionId);
    setTargetRevisionId(targetRevisionId);
  }, []);

  const navTabMapping = useMemo(() => {
    return {
      [PageAccessoriesModalContents.PageHistory]: {
        Icon: HistoryIcon,
        Content: () => {
          return <PageHistory onClose={close} sourceRevisionId={sourceRevisionId} targetRevisionId={targetRevisionId}/>;
        },
        i18n: t('History'),
        isLinkEnabled: () => !isGuestUser && !isSharedUser,
      },
      [PageAccessoriesModalContents.Attachment]: {
        Icon: AttachmentIcon,
        Content: () => {
          return <PageAttachment />;
        },
        i18n: t('attachment_data'),
      },
      [PageAccessoriesModalContents.ShareLink]: {
        Icon: ShareLinkIcon,
        Content: () => {
          return <ShareLink />;
        },
        i18n: t('share_links.share_link_management'),
        isLinkEnabled: () => !isGuestUser && !isReadOnlyUser && !isSharedUser && !isLinkSharingDisabled,
      },
    };
  }, [t, close, sourceRevisionId, targetRevisionId, isGuestUser, isReadOnlyUser, isSharedUser, isLinkSharingDisabled]);

  const buttons = useMemo(() => (
    <div className="d-flex flex-nowrap">
      <ExpandOrContractButton
        isWindowExpanded={isWindowExpanded}
        expandWindow={() => setIsWindowExpanded(true)}
        contractWindow={() => setIsWindowExpanded(false)}
      />
      <button type="button" className="close" onClick={close} aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  ), [close, isWindowExpanded]);

  if (status == null || status.activatedContents == null) {
    return <></>;
  }

  const { isOpened } = status;

  return (
    <Modal
      size="xl"
      isOpen={isOpened}
      toggle={close}
      data-testid="page-accessories-modal"
      className={`grw-page-accessories-modal ${styles['grw-page-accessories-modal']} ${isWindowExpanded ? 'grw-modal-expanded' : ''} `}
    >
      <ModalHeader className="p-0" toggle={close} close={buttons}>
        <CustomNavTab
          activeTab={status.activatedContents}
          navTabMapping={navTabMapping}
          breakpointToHideInactiveTabsDown="md"
          onNavSelected={selectContents}
          hideBorderBottom
        />
      </ModalHeader>
      <ModalBody className="overflow-auto grw-modal-body-style">
        <CustomTabContent activeTab={status.activatedContents} navTabMapping={navTabMapping} />
      </ModalBody>
    </Modal>
  );
};
