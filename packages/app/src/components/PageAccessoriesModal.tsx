import React, { useMemo, useState } from 'react';

import {
  Modal, ModalBody, ModalHeader,
} from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { useIsGuestUser, useIsSharedUser } from '~/stores/context';
import { usePageAccessoriesModal, PageAccessoriesModalContents } from '~/stores/ui';
import AppContainer from '~/client/services/AppContainer';

import HistoryIcon from './Icons/HistoryIcon';
import AttachmentIcon from './Icons/AttachmentIcon';
import ShareLinkIcon from './Icons/ShareLinkIcon';
import { withUnstatedContainers } from './UnstatedUtils';
import PageAttachment from './PageAttachment';
import PageHistory from './PageHistory';
import ShareLink from './ShareLink/ShareLink';
import { CustomNavTab } from './CustomNavigation/CustomNav';
import ExpandOrContractButton from './ExpandOrContractButton';
import CustomTabContent from './CustomNavigation/CustomTabContent';


type Props = {
  appContainer: AppContainer,
  isLinkSharingDisabled: boolean,
}

const PageAccessoriesModal = (props: Props): JSX.Element => {
  const {
    appContainer,
  } = props;

  const isLinkSharingDisabled = appContainer.config.disableLinkSharing;

  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<PageAccessoriesModalContents>(PageAccessoriesModalContents.PageHistory);
  const [isWindowExpanded, setIsWindowExpanded] = useState(false);

  const { data: isSharedUser } = useIsSharedUser();
  const { data: isGuestUser } = useIsGuestUser();

  // const { data: status, close } = usePageAccessoriesModal({
  //   isOpened: false,
  //   onOpened: (activatedContents) => {
  //     setActiveTab(activatedContents);
  //   },
  // });
  const { data: status, close } = usePageAccessoriesModal();

  const navTabMapping = useMemo(() => {
    return {
      [PageAccessoriesModalContents.PageHistory]: {
        Icon: HistoryIcon,
        Content: () => <PageHistory />,
        i18n: t('History'),
        index: 0,
        isLinkEnabled: () => !isGuestUser && !isSharedUser,
      },
      [PageAccessoriesModalContents.Attachment]: {
        Icon: AttachmentIcon,
        Content: () => <PageAttachment />,
        i18n: t('attachment_data'),
        index: 1,
      },
      [PageAccessoriesModalContents.ShareLink]: {
        Icon: ShareLinkIcon,
        Content: () => <ShareLink />,
        i18n: t('share_links.share_link_management'),
        index: 2,
        isLinkEnabled: () => !isGuestUser && !isSharedUser && !isLinkSharingDisabled,
      },
    };
  }, [t, isGuestUser, isSharedUser, isLinkSharingDisabled]);

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
      className={`grw-page-accessories-modal ${isWindowExpanded ? 'grw-modal-expanded' : ''} `}
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

/**
 * Wrapper component for using unstated
 */
const PageAccessoriesModalWrapper = withUnstatedContainers(PageAccessoriesModal, [AppContainer]);

export default PageAccessoriesModalWrapper;
