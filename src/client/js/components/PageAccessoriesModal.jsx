import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane,
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
  },
  timeline:  {
    icon: <TimeLineIcon />,
    i18n: 'Timeline View',
    index: 1,
  },
  pageHistory: {
    icon: <RecentChangesIcon />,
    i18n: 'History',
    index: 2,
  },
  attachment: {
    icon: <AttachmentIcon />,
    i18n: 'attachment_data',
    index: 3,
  },
  shareLink: {
    icon: <ShareLinkIcon />,
    i18n: 'share_links.share_link_management',
    index: 4,
  },
};

const PageAccessoriesModal = (props) => {
  const { t, pageAccessoriesContainer } = props;
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
        {/* [TODO: insert a modal header and move nav tabs there  by gw-3890] */}
        <ModalHeader className="p-0" toggle={closeModalHandler}>
          <Nav className="nav-title" id="nav-title">
            {Object.entries(navTabMapping).map(([key, value]) => {
              return (
                <NavItem key={key} type="button" className={`p-0 nav-link ${activeTab === key && 'active'}`}>
                  <NavLink onClick={() => { switchActiveTab(key) }}>
                    {value.icon}
                    {t(value.i18n)}
                  </NavLink>
                </NavItem>
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
            <TabPane tabId="shareLink">
              {pageAccessoriesContainer.state.activeComponents.has('shareLink') && <ShareLink />}
            </TabPane>
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
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default withTranslation()(PageAccessoriesModalWrapper);
