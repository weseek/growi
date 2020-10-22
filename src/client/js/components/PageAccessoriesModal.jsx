import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane, UncontrolledTooltip,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import RecentChangesIcon from './Icons/RecentChangesIcon';
import AttachmentIcon from './Icons/AttachmentIcon';
import ShareLinkIcon from './Icons/ShareLinkIcon';

import { withUnstatedContainers } from './UnstatedUtils';
import PageAccessoriesContainer from '../services/PageAccessoriesContainer';
import PageAttachment from './PageAttachment';
import PageTimeline from './PageTimeline';
import PageList from './PageList';
import PageHistory from './PageHistory';
import ShareLink from './ShareLink/ShareLink';


const navTabMapping = {
  pagelist: {
    icon: <PageListIcon />,
    i18n: 'page_list',
    index: 0,
    isGuestNotAllowed: false,
  },
  timeline:  {
    icon: <TimeLineIcon />,
    i18n: 'Timeline View',
    index: 1,
    isGuestNotAllowed: false,
  },
  pageHistory: {
    icon: <RecentChangesIcon />,
    i18n: 'History',
    index: 2,
    isGuestNotAllowed: false,
  },
  attachment: {
    icon: <AttachmentIcon />,
    i18n: 'attachment_data',
    index: 3,
    isGuestNotAllowed: false,
  },
  shareLink: {
    icon: <ShareLinkIcon />,
    i18n: 'share_links.share_link_management',
    index: 4,
    isGuestNotAllowed: true,
  },
};

const PageAccessoriesModal = (props) => {
  const { t, pageAccessoriesContainer, isGuestUserMode } = props;
  const { switchActiveTab } = pageAccessoriesContainer;
  const { activeTab } = pageAccessoriesContainer.state;

  const [sliderWidth, setSliderWidth] = useState(null);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(null);

  function closeModalHandler() {
    if (props.onClose == null) {
      return;
    }
    props.onClose();
  }

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }

  useEffect(() => {
    if (activeTab === '') {
      return;
    }

    const navTitle = document.getElementById('nav-title');
    const navTabs = document.querySelectorAll('li.nav-link');

    if (navTitle == null || navTabs == null) {
      return;
    }

    let tempML = 0;

    const styles = [].map.call(navTabs, (el) => {
      const width = getPercentage(el.offsetWidth, navTitle.offsetWidth);
      const marginLeft = tempML;
      tempML += width;
      return { width, marginLeft };
    });

    const { width, marginLeft } = styles[navTabMapping[activeTab].index];

    setSliderWidth(width);
    setSliderMarginLeft(marginLeft);

  }, [activeTab]);


  return (
    <React.Fragment>
      <Modal size="xl" isOpen={props.isOpen} toggle={closeModalHandler} className="grw-page-accessories-modal">
        <ModalHeader className="p-0" toggle={closeModalHandler}>
          <Nav className="nav-title" id="nav-title">
            {Object.entries(navTabMapping).map(([key, value]) => {
              const isDisabledNavLink = (isGuestUserMode && value.isGuestNotAllowed);
              return (
                <React.Fragment key={key}>
                  <NavItem id={key} type="button" className={`p-0 nav-link ${activeTab === key && 'active'}`}>
                    <NavLink disabled={isDisabledNavLink} onClick={() => { switchActiveTab(key) }}>
                      {value.icon}
                      {t(value.i18n)}
                    </NavLink>
                  </NavItem>
                  {(isDisabledNavLink) && (
                    <UncontrolledTooltip placement="bottom" target={key} fade={false}>
                      {t('Not available for guest')}
                    </UncontrolledTooltip>
                  )}
                </React.Fragment>
              );
            })}
          </Nav>
          <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />
        </ModalHeader>
        <ModalBody className="overflow-auto grw-modal-body-style p-0">
          <TabContent activeTab={activeTab} className="p-5">
            <TabPane tabId="pagelist">
              {pageAccessoriesContainer.state.activeComponents.has('pagelist') && <PageList />}
            </TabPane>
            <TabPane tabId="timeline">
              {pageAccessoriesContainer.state.activeComponents.has('timeline') && <PageTimeline /> }
            </TabPane>
            <TabPane tabId="pageHistory">
              <div className="overflow-auto">
                {pageAccessoriesContainer.state.activeComponents.has('pageHistory') && <PageHistory /> }
              </div>
            </TabPane>
            <TabPane tabId="attachment">
              {pageAccessoriesContainer.state.activeComponents.has('attachment') && <PageAttachment />}
            </TabPane>
            {!isGuestUserMode && (
              <TabPane tabId="shareLink">
                {pageAccessoriesContainer.state.activeComponents.has('shareLink') && <ShareLink />}
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
  // pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,
  isGuestUserMode: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default withTranslation()(PageAccessoriesModalWrapper);
