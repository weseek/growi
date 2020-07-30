
import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

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
    <Modal
      size="lg"
      isOpen={props.isOpen}
      toggle={props.onClose}
      isActive={props.isActive}
      className="grw-create-page"
    >
      <ModalHeader tag="h4">
        <ul className="nav nav-tabs"> {/* nav-tabsは一時的につけているだけ */}
          <li className="nav-item">
            <a className={`nav-link page-accessories ${isActive === 'pageList' && 'active'}`} href="#">
              <PageList
                className="mx-5"
              />
              ページリスト
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link page-accessories ${isActive === 'pageList' && 'active'}`} href="#">
              <TimeLine />
              タイムライン
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link page-accessories ${isActive === 'recentChanges' && 'active'}`} href="#">
              <RecentChanges />
              更新履歴
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link page-accessories ${isActive === 'attachment' && 'active'}`} href="#">
              <Attachment />
              添付データ
            </a>
          </li>
        </ul>
      </ModalHeader>
      <ModalBody>
      </ModalBody>
    </Modal>

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
  onClose: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
};

export default withTranslation()(PageAccessoriesModalWrapper);
