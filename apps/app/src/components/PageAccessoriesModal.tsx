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
import { PageHistory, getQueryParam } from './PageHistory';
import ShareLink from './ShareLink/ShareLink';

import styles from './PageAccessoriesModal.module.scss';

const PageAccessoriesModal = (): JSX.Element => {

  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<PageAccessoriesModalContents>();
  const [sourceRevisionId, setSourceRevisionId] = useState<string>();
  const [targetRevisionId, setTargetRevisionId] = useState<string>();

  const [isWindowExpanded, setIsWindowExpanded] = useState(false);

  const { data: isSharedUser } = useIsSharedUser();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isLinkSharingDisabled } = useDisableLinkSharing();

  const { data: status, mutate, close } = usePageAccessoriesModal();

  // activate tab when open
  useEffect(() => {
    if (status == null) return;

    const { isOpened, activatedContents } = status;
    if (isOpened && activatedContents != null) {
      setActiveTab(activatedContents);
    }
  }, [status]);

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
    mutate({ isOpened: true });
  }, [mutate]);

  const navTabMapping = useMemo(() => {
    return {
      [PageAccessoriesModalContents.PageHistory]: {
        Icon: HistoryIcon,
        Content: () => {
          return <PageHistory onClose={close} sourceRevisionId={sourceRevisionId} targetRevisionId={targetRevisionId}/>;
        },
        i18n: t('History'),
        index: 0,
        isLinkEnabled: () => !isGuestUser && !isSharedUser,
      },
      [PageAccessoriesModalContents.Attachment]: {
        Icon: AttachmentIcon,
        Content: () => {
          return <PageAttachment />;
        },
        i18n: t('attachment_data'),
        index: 1,
      },
      [PageAccessoriesModalContents.ShareLink]: {
        Icon: ShareLinkIcon,
        Content: () => {
          return <ShareLink />;
        },
        i18n: t('share_links.share_link_management'),
        index: 2,
        isLinkEnabled: () => !isGuestUser && !isSharedUser && !isLinkSharingDisabled,
      },
    };
  }, [t, close, sourceRevisionId, targetRevisionId, isGuestUser, isSharedUser, isLinkSharingDisabled]);

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

  if (status == null || activeTab == null) {
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
