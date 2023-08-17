import React, { useMemo, useState } from 'react';

import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
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

import { useAutoOpenModalByQueryParam } from './hooks';

import styles from './PageAccessoriesModal.module.scss';


const PageAttachment = dynamic(() => import('./PageAttachment'), { ssr: false });
const PageHistory = dynamic(() => import('./PageHistory').then(mod => mod.PageHistory), { ssr: false });
const ShareLink = dynamic(() => import('./ShareLink').then(mod => mod.ShareLink), { ssr: false });


export const PageAccessoriesModal = (): JSX.Element => {

  const { t } = useTranslation();

  const [isWindowExpanded, setIsWindowExpanded] = useState(false);

  const { data: isSharedUser } = useIsSharedUser();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: isLinkSharingDisabled } = useDisableLinkSharing();

  const { data: status, close, selectContents } = usePageAccessoriesModal();

  useAutoOpenModalByQueryParam();

  const navTabMapping = useMemo(() => {
    return {
      [PageAccessoriesModalContents.PageHistory]: {
        Icon: HistoryIcon,
        Content: () => {
          return <PageHistory onClose={close} />;
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
  }, [t, close, isGuestUser, isReadOnlyUser, isSharedUser, isLinkSharingDisabled]);

  const buttons = useMemo(() => (
    <span className='me-3'>
      <ExpandOrContractButton
        isWindowExpanded={isWindowExpanded}
        expandWindow={() => setIsWindowExpanded(true)}
        contractWindow={() => setIsWindowExpanded(false)}
      />
      <button type="button" className="btn btn-close" onClick={close} aria-label="Close"></button>
    </span>
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
