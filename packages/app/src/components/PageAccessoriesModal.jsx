import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalBody, ModalHeader, TabContent, TabPane,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';
import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import HistoryIcon from './Icons/HistoryIcon';
import AttachmentIcon from './Icons/AttachmentIcon';
import ShareLinkIcon from './Icons/ShareLinkIcon';

import { withUnstatedContainers } from './UnstatedUtils';
import PageAccessoriesContainer from '../services/PageAccessoriesContainer';
import PageAttachment from './PageAttachment';
import PageTimeline from './PageTimeline';
import PageList from './PageList';
import PageHistory from './PageHistory';
import ShareLink from './ShareLink/ShareLink';
import { CustomNavTab } from './CustomNavigation/CustomNav';
import ExpandOrContractButton from './ExpandOrContractButton';

const PageAccessoriesModal = (props) => {
  const {
    t, pageAccessoriesContainer, onClose, isGuestUser, isSharedUser, isNotFoundPage,
  } = props;
  const isLinkSharingDisabled = pageAccessoriesContainer.appContainer.config.disableLinkSharing;
  const { switchActiveTab } = pageAccessoriesContainer;
  const { activeTab, activeComponents } = pageAccessoriesContainer.state;
  const [isWindowExpanded, setIsWindowExpanded] = useState(false);

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        i18n: t('page_list'),
        index: 0,
        isLinkEnabled: v => !isSharedUser,
      },
      timeline: {
        Icon: TimeLineIcon,
        i18n: t('Timeline View'),
        index: 1,
        isLinkEnabled: v => !isSharedUser,
      },
      pageHistory: {
        Icon: HistoryIcon,
        i18n: t('History'),
        index: 2,
        isLinkEnabled: v => !isGuestUser && !isSharedUser && !isNotFoundPage,
      },
      attachment: {
        Icon: AttachmentIcon,
        i18n: t('attachment_data'),
        index: 3,
        isLinkEnabled: v => !isNotFoundPage,
      },
      shareLink: {
        Icon: ShareLinkIcon,
        i18n: t('share_links.share_link_management'),
        index: 4,
        isLinkEnabled: v => !isGuestUser && !isSharedUser && !isNotFoundPage && !isLinkSharingDisabled,
      },
    };
  }, [t, isGuestUser, isSharedUser, isNotFoundPage, isLinkSharingDisabled]);

  const closeModalHandler = useCallback(() => {
    if (onClose == null) {
      return;
    }
    onClose();
  }, [onClose]);

  const expandWindow = () => {
    setIsWindowExpanded(true);
  };

  const contractWindow = () => {
    setIsWindowExpanded(false);
  };

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

  return (
    <React.Fragment>
      <Modal
        size="xl"
        isOpen={props.isOpen}
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
              {activeComponents.has('pagelist') && <PageList />}
            </TabPane>
            <TabPane tabId="timeline">
              {activeComponents.has('timeline') && <PageTimeline /> }
            </TabPane>
            {!isGuestUser && (
              <TabPane tabId="pageHistory">
                {activeComponents.has('pageHistory') && <PageHistory /> }
              </TabPane>
            )}
            <TabPane tabId="attachment">
              {activeComponents.has('attachment') && <PageAttachment />}
            </TabPane>
            {!isGuestUser && (
              <TabPane tabId="shareLink">
                {activeComponents.has('shareLink') && <ShareLink />}
              </TabPane>
            )}
          </TabContent>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

/**
 * Wrapper component for using unstated
 */
const PageAccessoriesModalWrapper = withUnstatedContainers(PageAccessoriesModal, [PageAccessoriesContainer]);

PageAccessoriesModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,
  isGuestUser: PropTypes.bool.isRequired,
  isSharedUser: PropTypes.bool.isRequired,
  isNotFoundPage: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default withTranslation()(PageAccessoriesModalWrapper);
