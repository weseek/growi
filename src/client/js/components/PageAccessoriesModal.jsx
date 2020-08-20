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
import PageList from './PageList';

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
            <NavItem type="button" className={`nav-link ${activeTab === 'pagelist' && 'active active-border'}`}>
              <NavLink
                onClick={() => { switchActiveTab('pagelist') }}
              >
                <PageListIcon />
                { t('page_list') }
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'timeline' && 'active active-border'}`}>
              <NavLink
                onClick={() => { switchActiveTab('timeline') }}
              >
                <TimeLineIcon />
                { t('Timeline View') }
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'recent-changes' && 'active active-border'}`}>
              <NavLink
                onClick={() => { switchActiveTab('recent-changes') }}
              >
                <RecentChangesIcon />
                { t('History') }
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'attachment' && 'active active-border'}`}>
              <NavLink
                onClick={() => { switchActiveTab('attachment') }}
              >
                <AttachmentIcon />
                { t('attachment_data') }
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="pagelist">
              {pageAccessoriesContainer.state.activeComponents.has('pagelist') && <PageList />}
            </TabPane>
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
