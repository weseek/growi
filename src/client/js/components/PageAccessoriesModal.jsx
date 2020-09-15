import React from 'react';
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

const PageAccessoriesModal = (props) => {
  const { t, pageAccessoriesContainer } = props;
  const { switchActiveTab } = pageAccessoriesContainer;
  const { activeTab } = pageAccessoriesContainer.state;

  function closeModalHandler() {
    if (props.onClose == null) {
      return;
    }
    props.onClose();
  }

  const menu = document.getElementsByClassName('nav');
  const navTitle = document.getElementById('nav-title');
  // Values are set.

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }

  // Not using reduce, because IE8 doesn't supprt it
  function getArraySum(arr) {
    let sum = 0;
    [].forEach.call(arr, (el, index) => {
      sum += el;
    });
    return sum;
  }

  function navSlider(menu, callback) {
    // We only want the <li> </li> tags
    const navTabs = document.querySelectorAll('li.nav-link');

    if (menu.length > 0) {
      const marginLeft = [];
      // Loop through nav children i.e li
      [].forEach.call(navTabs, (el, index) => {
        // Dynamic width/margin calculation for hr
        const width = getPercentage(el.offsetWidth, navTitle.offsetWidth);
        let tempMarginLeft = 0;
        // We don't want to modify first elements positioning
        if (index !== 0) {
          tempMarginLeft = getArraySum(marginLeft);
        }
        // Set mouse event [click]
        callback(el, width, tempMarginLeft);
        /* We store it in array because the later accumulated value is used for positioning */
        marginLeft.push(width);
      });
    }
  }

  if (menu != null) {
    // CLICK
    const menuSliderClick = document.getElementById('grw-nav-slide-hr');
    if (menuSliderClick != null) {
      const arrayMenu = Array.from(menu);

      navSlider(arrayMenu, (el, width, tempMarginLeft) => {
        el.onclick = () => {
          menuSliderClick.style.width = `${width}%`;
          menuSliderClick.style.marginLeft = `${tempMarginLeft}%`;
        };
      });
    }
  } // endif


  return (
    <React.Fragment>
      <Modal size="xl" isOpen={props.isOpen} toggle={closeModalHandler} className="grw-page-accessories-modal">
        <ModalBody>
          <Nav className="nav-title" id="nav-title">
            <NavItem type="button" className={`nav-link ${activeTab === 'pagelist' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('pagelist');
                }}
              >
                <PageListIcon />
                {t('page_list')}
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'timeline' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('timeline');
                }}
              >
                <TimeLineIcon />
                {t('Timeline View')}
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'page-history' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('page-history');
                }}
              >
                <RecentChangesIcon />
                {t('History')}
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'attachment' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('attachment');
                }}
              >
                <AttachmentIcon />
                {t('attachment_data')}
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'share-link' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('share-link');
                }}
              >
                <ShareLinkIcon />
                {t('share_links.share_link_management')}
              </NavLink>
            </NavItem>
          </Nav>
          <hr id="grw-nav-slide-hr" className="my-0"></hr>
          <div className="page-list-container-create">
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
          </div>
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
