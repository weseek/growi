import React, {
  useRef, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane,
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


const navTabMapping = [
  {
    icon: <PageListIcon />,
    id: 'pagelist',
    i18n: 'page_list',
    index: 0,
  },
  {
    icon: <TimeLineIcon />,
    id: 'timeline',
    i18n: 'Timeline View',
    index: 1,
  },
  {
    icon: <RecentChangesIcon />,
    id: 'page-history',
    i18n: 'History',
    index: 2,
  },
  {
    icon: <AttachmentIcon />,
    id: 'attachment',
    i18n: 'attachment_data',
    index: 3,
  },
  {
    icon: <ShareLinkIcon />,
    id: 'share-link',
    i18n: 'share_links.share_link_management',
    index: 4,
  },
];

const PageAccessoriesModal = (props) => {
  const { t, pageAccessoriesContainer } = props;
  const { switchActiveTab } = pageAccessoriesContainer;
  const { activeTab } = pageAccessoriesContainer.state;

  const sliderEl = useRef(null);
  const navLinkEls = useRef([]);

  navTabMapping.forEach((data, i) => {
    navLinkEls.current[i] = React.createRef();
  });

  function closeModalHandler() {
    if (props.onClose == null) {
      return;
    }
    props.onClose();
  }

  const navTitle = document.getElementById('nav-title');
  const navTabs = document.querySelectorAll('li.nav-link');

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }

  function changeFlexibility(width, tempMarginLeft) {
    sliderEl.current.width = `${width}%`;
    sliderEl.current.style.marginLeft = `${tempMarginLeft}%`;
  }

  const fetchSize = useCallback(() => {
    return [].map.call(navTabs, (el) => {
      const width = getPercentage(el.offsetWidth, navTitle.offsetWidth);
      return width;
    });
  }, [navTabs, navTitle]);

  useEffect(() => {
    const array = fetchSize();

    if (activeTab === '') {
      return;
    }


    const result = navTabMapping.find(({ id }) => id === activeTab);
    const { index } = result;


    let marginLeft = 0;
    for (let i = 0; i < index; i++) {
      marginLeft += array[index];
    }

    console.log(marginLeft);
    changeFlexibility(array[index], marginLeft);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);


  return (
    <React.Fragment>
      <Modal size="xl" isOpen={props.isOpen} toggle={closeModalHandler} className="grw-page-accessories-modal">
        <ModalBody>
          <Nav className="nav-title" id="nav-title">
            {navTabMapping.map((tab, index) => {
              return (
                <NavItem key={tab.id} type="button" className={`nav-link ${activeTab === tab.id && 'active'}`}>
                  <NavLink innerRef={navLinkEls.current[index]} onClick={() => { switchActiveTab(tab.id) }}>
                    {tab.icon}
                    {t(tab.i18n)}
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>
          <hr ref={sliderEl} id="grw-nav-slide-hr" className="my-0" />
          <TabContent activeTab={activeTab}>
            <TabPane tabId="pagelist">
              {pageAccessoriesContainer.state.activeComponents.has('pagelist') && <PageList />}
            </TabPane>
            <TabPane tabId="timeline" className="p-4">
              {pageAccessoriesContainer.state.activeComponents.has('timeline') && <PageTimeline /> }
            </TabPane>
            <TabPane tabId="page-history">
              <div className="overflow-auto">
                {pageAccessoriesContainer.state.activeComponents.has('page-history') && <PageHistory /> }
              </div>
            </TabPane>
            <TabPane tabId="attachment" className="p-4">
              {pageAccessoriesContainer.state.activeComponents.has('attachment') && <PageAttachment />}
            </TabPane>
            <TabPane tabId="share-link" className="p-4">
              {pageAccessoriesContainer.state.activeComponents.has('share-link') && <ShareLink />}
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
