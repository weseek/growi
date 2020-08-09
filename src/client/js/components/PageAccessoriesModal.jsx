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
import PageContainer from '../services/PageContainer';
import PageAttachment from './PageAttachment';

const PageAccessoriesModal = (props) => {
  const { t } = props;

  function closeModalHandler() {
    if (props.onClose == null) {
      return;
    }
    props.onClose();
  }

  function switchTabHandler(clickedTab) {
    if (props.onSwitch == null) {
      return;
    }
    props.onSwitch(clickedTab);
  }

  return (
    <React.Fragment>
      <Modal
        size="lg"
        isOpen={props.isOpen}
        toggle={closeModalHandler}
        className="grw-page-accessories-modal"
      >
        <ModalBody>
          <Nav className="nav-title border-bottom">
            <NavItem className={`nav-link ${props.activeTab === 'pagelist' && 'active active-border'}`}>
              <NavLink
                onClick={() => { switchTabHandler('pagelist') }}
                href="#pagelist"
              >
                <PageListIcon />
                { t('page_list') }
              </NavLink>
            </NavItem>
            <NavItem className={`nav-link ${props.activeTab === 'timeline' && 'active active-border'}`}>
              <NavLink
                onClick={() => { switchTabHandler('timeline') }}
                href="#timeline"
              >
                <TimeLineIcon />
                { t('Timeline View') }
              </NavLink>
            </NavItem>
            <NavItem className={`nav-link ${props.activeTab === 'recent-changes' && 'active active-border'}`}>
              <NavLink
                onClick={() => { switchTabHandler('recent-changes') }}
                href="#recent-changes"
              >
                <RecentChangesIcon />
                { t('History') }
              </NavLink>
            </NavItem>
            <NavItem className={`nav-link ${props.activeTab === 'attachment' && 'active active-border'}`}>
              <NavLink
                onClick={() => { switchTabHandler('attachment') }}
                href="#attachment"
              >
                <AttachmentIcon />
                { t('attachment_data') }
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={props.activeTab}>
            <TabPane tabId="pagelist"></TabPane>
            <TabPane tabId="timeline"></TabPane>
            <TabPane tabId="recent-changes"></TabPane>
            <TabPane tabId="attachment" className="p-4">
              {props.activeComponents.has('attachment') && <PageAttachment /> }
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
const PageAccessoriesModalWrapper = withUnstatedContainers(PageAccessoriesModal, [PageContainer]);


PageAccessoriesModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  activeTab: PropTypes.string.isRequired,
  activeComponents: PropTypes.object.isRequired,
  onSwitch: PropTypes.func,
};

export default withTranslation()(PageAccessoriesModalWrapper);
