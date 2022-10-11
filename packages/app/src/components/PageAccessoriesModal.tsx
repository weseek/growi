import React, { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalBody, ModalHeader,
} from 'reactstrap';

import {
  useDisableLinkSharing, useIsGuestUser, useIsSharedUser,
} from '~/stores/context';
import { usePageAccessoriesModal, PageAccessoriesModalContents } from '~/stores/modal';

import { CustomNavTab } from './CustomNavigation/CustomNav';
import CustomTabContent from './CustomNavigation/CustomTabContent';
import ExpandOrContractButton from './ExpandOrContractButton';
import AttachmentIcon from './Icons/AttachmentIcon';
import HistoryIcon from './Icons/HistoryIcon';
import ShareLinkIcon from './Icons/ShareLinkIcon';
import PageAttachment from './PageAttachment';
import { PageHistory } from './PageHistory';
import ShareLink from './ShareLink/ShareLink';

import styles from './PageAccessoriesModal.module.scss';

const PageAccessoriesModal = (): JSX.Element => {

  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<PageAccessoriesModalContents>(PageAccessoriesModalContents.PageHistory);
  const [isWindowExpanded, setIsWindowExpanded] = useState(false);

  const { data: isSharedUser } = useIsSharedUser();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isLinkSharingDisabled } = useDisableLinkSharing();

  const { data: status, mutate, close } = usePageAccessoriesModal();

  // add event handler when opened
  useEffect(() => {
    if (status == null || status.onOpened != null) {
      return;
    }
    mutate({
      ...status,
      onOpened: (activatedContents) => {
        setActiveTab(activatedContents);
      },
    }, false);
  }, [mutate, status]);

  const navTabMapping = useMemo(() => {
    const isOpened = status == null ? false : status.isOpened;
    return {
      [PageAccessoriesModalContents.PageHistory]: {
        Icon: HistoryIcon,
        Content: () => {
          if (!isOpened) {
            return <></>;
          }
          return <PageHistory />;
        },
        i18n: t('History'),
        index: 0,
        isLinkEnabled: () => !isGuestUser && !isSharedUser,
      },
      [PageAccessoriesModalContents.Attachment]: {
        Icon: AttachmentIcon,
        Content: () => {
          if (!isOpened) {
            return <></>;
          }
          return <PageAttachment />;
        },
        i18n: t('attachment_data'),
        index: 1,
      },
      [PageAccessoriesModalContents.ShareLink]: {
        Icon: ShareLinkIcon,
        Content: () => {
          if (!isOpened) {
            return <></>;
          }
          return <ShareLink />;
        },
        i18n: t('share_links.share_link_management'),
        index: 2,
        isLinkEnabled: () => !isGuestUser && !isSharedUser && !isLinkSharingDisabled,
      },
    };
  }, [status, t, isGuestUser, isSharedUser, isLinkSharingDisabled]);

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

  if (status == null) {
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
          activeTab={activeTab}
          navTabMapping={navTabMapping}
          breakpointToHideInactiveTabsDown="md"
          onNavSelected={(v) => {
            setActiveTab(v);
          }}
          hideBorderBottom
        />
      </ModalHeader>
      <ModalBody className="overflow-auto grw-modal-body-style">
        <CustomTabContent activeTab={activeTab} navTabMapping={navTabMapping} />
      </ModalBody>
    </Modal>
  );
};

export default PageAccessoriesModal;
