import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalBody, TabContent, Nav, NavItem, NavLink,
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

  return (
    // <Modal
    //   size="lg"
    //   isOpen={props.isOpen}
    //   toggle={props.onClose}
    //   className="grw-page-accessories-modal"
    // >
    //   <ModalBody>
    //     <ul className="nav border-bottom">
    //       <li className="nav-item">
  // <a className={`nav-link ${props.isActive === 'pageList' && 'active'}`}>
  //   <PageList />
  //   { t('page_list') }
  // </a>
    //       </li>
    //       <li className="nav-item">
    // <a className={`nav-link ${props.isActive === 'timeLine' && 'active'}`}>
    //   <TimeLine />
    //   { t('Timeline View') }
    // </a>
    //       </li>
    //       <li className="nav-item">
    // <a className={`nav-link ${props.isActive === 'recentChanges' && 'active'}`}>
    //   <RecentChanges />
    //   { t('History') }
    // </a>
    //       </li>
    //       <li className="nav-item">
    // <a className={`nav-link ${props.isActive === 'attachment' && 'active'}`}>
    //   <Attachment />
    //   { t('attachment_data') }
    // </a>
    //       </li>
    //     </ul>
    //   </ModalBody>
    // </Modal>
    <React.Fragment>
      <Modal
        size="lg"
        isOpen={props.isOpen}
        toggle={props.onClose}
        className="grw-page-accessories-modal"
      >
        <ModalBody>
          <Nav>
            <NavItem className="border-bottom">
              <NavLink>
                <a className={`nav-link ${props.isActive === 'pageList' && 'active'}`}>
                  <PageList />
                  { t('page_list') }
                </a>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink>
                <a className={`nav-link ${props.isActive === 'timeLine' && 'active'}`}>
                  <TimeLine />
                  { t('Timeline View') }
                </a>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink>
                <a className={`nav-link ${props.isActive === 'recentChanges' && 'active'}`}>
                  <RecentChanges />
                  { t('History') }
                </a>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink>
                <a className={`nav-link ${props.isActive === 'attachment' && 'active'}`}>
                  <Attachment />
                  { t('attachment_data') }
                </a>
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
  isActive: PropTypes.string.isRequired,
};

export default withTranslation()(PageAccessoriesModalWrapper);
