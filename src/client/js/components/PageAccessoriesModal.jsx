import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalBody, Nav, NavItem, NavLink, TabContent,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import PageList from './PageList';
import TimeLine from './TimeLine';
import RecentChanges from './RecentChanges';
import Attachment from './Attachment';

import { withUnstatedContainers } from './UnstatedUtils';
import PageContainer from '../services/PageContainer';

const PageAccessoriesModal = (props) => {
  const { t } = props;

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
            <NavItem className={`nav-link ${props.activeTab === 'pageList' && 'active'}`}>
              <NavLink>
                <PageList />
                { t('page_list') }
              </NavLink>
            </NavItem>
            <NavItem className={`nav-link ${props.activeTab === 'timeLine' && 'active'}`}>
              <NavLink>
                <TimeLine />
                { t('Timeline View') }
              </NavLink>
            </NavItem>
            <NavItem className={`nav-link ${props.activeTab === 'recentChanges' && 'active'}`}>
              <NavLink>
                <RecentChanges />
                { t('History') }
              </NavLink>
            </NavItem>
            <NavItem className={`nav-link ${props.activeTab === 'attachment' && 'active'}`}>
              <NavLink>
                <Attachment />
                { t('attachment_data') }
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent>
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
};

export default withTranslation()(PageAccessoriesModalWrapper);
