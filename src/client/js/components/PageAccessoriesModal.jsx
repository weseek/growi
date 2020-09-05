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

import { withUnstatedContainers } from './UnstatedUtils';
import PageAccessoriesContainer from '../services/PageAccessoriesContainer';
import PageAttachment from './PageAttachment';

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

  const menu = document.getElementsByClassName('nav'); // 上部に持ってきた
  // Values are set.

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    console.log(`min is ${min}`);
    console.log(`max is ${min}`);

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

  function navSlider(menu, callback) { // ok
    const arrayMenu1 = Array.from(menu);
    const menuWidth = arrayMenu1.offsetWidth; // not ok
    console.log(`arrayMenu1 = ${arrayMenu1}, menu.offsetWidth =${menu.offsetWidth}, menuWidth = ${menuWidth} `);
    // We only want the <li> </li> tags
    const navTabs = document.querySelectorAll('li.nav-link');

    if (menu.length > 0) {
      const marginLeft = [];
      // Loop through nav children i.e li
      [].forEach.call(navTabs, (el, index) => {
        console.log(navTabs);
        // Dynamic width/margin calculation for hr
        const width = getPercentage(el.offsetWidth, menuWidth);
        console.log(width);
        let tempMarginLeft = 0;
        // We don't want to modify first elements positioning
        if (index !== 0) {
          tempMarginLeft = getArraySum(marginLeft);
        }
        // Set mouse event  hover/click
        callback(el, width, tempMarginLeft);
        /* We store it in array because the later accumulated value is used for positioning */
        marginLeft.push(width);
      });
    }
  }

  if (menu) {
    // CLICK
    const menuSliderClick = document.getElementById('nav_slide_click');
    console.log('menu clicked');
    if (menuSliderClick) {
      console.log(`menu = ${menu}`);
      const arrayMenu = Array.from(menu); // 変換してみた
      console.log(`arrayMenu = ${arrayMenu}`);
      console.log(`arrayMenu.length = ${arrayMenu.length}`);

      navSlider(arrayMenu, (el, width, tempMarginLeft) => {
        console.log('navSlider functionが実行されようとしている');
        el.onclick = () => {
          console.log('el がクリックされた');
          menuSliderClick.style.width = `${width}%`;
          menuSliderClick.style.marginLeft = `${tempMarginLeft}%`;
          console.log(`width = ${width}`);
          console.log(`tempMarginLeft = ${tempMarginLeft}`);
        };
      });
      // ↑二個目の引数は、新たに関数を作成し、それを呼び出す必要がありそう(onCkickした時の挙動で)

    }
  } // endif


  return (
    <React.Fragment>
      <Modal
        size="lg"
        isOpen={props.isOpen}
        toggle={closeModalHandler}
        className="grw-page-accessories-modal"
      >
        <ModalBody>
          <Nav className="nav-title" id="nav_slide_click">
            <NavItem type="button" className={`nav-link ${activeTab === 'pagelist' && 'active'}`}>
              <NavLink
                onClick={() => { switchActiveTab('pagelist') }}
              >
                <PageListIcon />
                { t('page_list') }
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'timeline' && 'active'}`}>
              <NavLink
                onClick={() => { switchActiveTab('timeline') }}
              >
                <TimeLineIcon />
                { t('Timeline View') }
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'recent-changes' && 'active'}`}>
              <NavLink
                onClick={() => { switchActiveTab('recent-changes') }}
              >
                <RecentChangesIcon />
                { t('History') }
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'attachment' && 'active'}`}>
              <NavLink
                onClick={() => { switchActiveTab('attachment') }}
              >
                <AttachmentIcon />
                { t('attachment_data') }
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="pagelist"></TabPane>
            <TabPane tabId="timeline"></TabPane>
            <TabPane tabId="recent-changes"></TabPane>
            <TabPane tabId="attachment" className="p-4">
              {pageAccessoriesContainer.state.activeComponents.has('attachment') && <PageAttachment /> }
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
