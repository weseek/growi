import React, {
  FC, useCallback, useMemo, useState,
} from 'react';

import {
  Modal, ModalBody, ModalHeader, TabContent, TabPane,
} from 'reactstrap';
import { useTranslation } from '~/i18n';

import PageListIcon from '../../client/js/components/Icons/PageListIcon';
import TimeLineIcon from '../../client/js/components/Icons/TimeLineIcon';
import HistoryIcon from '../../client/js/components/Icons/HistoryIcon';
import AttachmentIcon from '../../client/js/components/Icons/AttachmentIcon';
import ShareLinkIcon from '../../client/js/components/Icons/ShareLinkIcon';

// import PageTimeline from '../../client/js/components/PageTimeline';
import { PageList } from '~/components/PageAccessory/PageList';
import { PageHistory } from '~/components/PageAccessory/PageHistory';
import { PageAttachment } from '~/components/PageAccessory/PageAttachment';
import { ShareLink } from '~/components/PageAccessory/ShareLink';

import ExpandOrContractButton from '../../client/js/components/ExpandOrContractButton';

import { CustomNavTab } from '../../client/js/components/CustomNavigation/CustomNav';

import { AccessoryName } from '~/interfaces/accessory';

type Props = {
  isGuestUser: boolean;
  isSharedUser: boolean;
  isOpen: boolean;
  isNotFoundPage: boolean;
  onClose?: ()=>void;
  activeTab: AccessoryName;
  activeComponents: Set<AccessoryName>;
  switchActiveTab?: ()=> void;
}

export const PageAccessoriesModal:FC<Props> = (props:Props) => {
  const {
    isGuestUser, isSharedUser, isOpen, isNotFoundPage, onClose, activeComponents, activeTab, switchActiveTab,
  } = props;
  const { t } = useTranslation();
  const [isWindowExpanded, setIsWindowExpanded] = useState(false);

  const expandWindow = () => {
    setIsWindowExpanded(true);
  };

  const contractWindow = () => {
    setIsWindowExpanded(false);
  };

  const closeModalHandler = useCallback(() => {
    if (onClose == null) {
      return;
    }
    onClose();
  }, [onClose]);

  const buttons = (
    <div className="d-flex flex-nowrap">
      <ExpandOrContractButton
        isWindowExpanded={isWindowExpanded}
        expandWindow={expandWindow}
        contractWindow={contractWindow}
      />
      <button type="button" className="close" onClick={closeModalHandler} aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        i18n: t('page_list'),
        index: 0,
        isLinkEnabled: () => !isSharedUser,
      },
      timeline: {
        Icon: TimeLineIcon,
        i18n: t('Timeline View'),
        index: 1,
        isLinkEnabled: () => !isSharedUser,
      },
      pageHistory: {
        Icon: HistoryIcon,
        i18n: t('History'),
        index: 2,
        isLinkEnabled: () => !isGuestUser && !isSharedUser && !isNotFoundPage,
      },
      attachment: {
        Icon: AttachmentIcon,
        i18n: t('attachment_data'),
        index: 3,
        isLinkEnabled: () => !isNotFoundPage,
      },
      shareLink: {
        Icon: ShareLinkIcon,
        i18n: t('share_links.share_link_management'),
        index: 4,
        isLinkEnabled: () => !isGuestUser && !isSharedUser && !isNotFoundPage,
      },
    };
  }, [t, isGuestUser, isSharedUser, isNotFoundPage]);

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      toggle={closeModalHandler}
      className={`grw-page-accessories-modal ${isWindowExpanded ? 'grw-modal-expanded' : ''} `}
    >
      <ModalHeader className="p-0" toggle={closeModalHandler} close={buttons}>
        <CustomNavTab
          activeTab={activeTab}
          navTabMapping={navTabMapping}
          onNavSelected={switchActiveTab}
          breakpointToHideInactiveTabsDown="md"
          hideBorderBottom
        />
      </ModalHeader>
      <ModalBody className="overflow-auto grw-modal-body-style">
        {/* Do not use CustomTabContent because of performance problem:
              the 'navTabMapping[tabId].Content' for PageAccessoriesModal depends on activeComponents */}
        <TabContent activeTab={activeTab}>
          <TabPane tabId="pagelist">
            {activeComponents.has(AccessoryName.PAGE_LIST) && <PageList />}
          </TabPane>
          <TabPane tabId="timeline">
            {/* {activeComponents.has('timeline') && <PageTimeline /> } */}
          </TabPane>
          {!isGuestUser && (
            <TabPane tabId="pageHistory">
              {activeComponents.has(AccessoryName.PAGE_HISTORY) && <PageHistory /> }
            </TabPane>
          )}
          <TabPane tabId="attachment">
            {activeComponents.has(AccessoryName.ATTACHMENT) && <PageAttachment />}
          </TabPane>
          {!isGuestUser && (
            <TabPane tabId="shareLink">
              {activeComponents.has(AccessoryName.SHARE_LINK) && <ShareLink />}
            </TabPane>
          )}
        </TabContent>
      </ModalBody>
    </Modal>
  );
};
