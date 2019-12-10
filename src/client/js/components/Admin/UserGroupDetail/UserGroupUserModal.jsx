import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/es/Modal';

import UserGroupUserFormByInput from './UserGroupUserFormByInput';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';

class UserGroupUserModal extends React.Component {

  render() {
    const { t, userGroupDetailContainer } = this.props;

    return (
      <Modal show={userGroupDetailContainer.state.isUserGroupUserModalOpen} onHide={userGroupDetailContainer.closeUserGroupUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('user_group_management.add_user')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-3">
            <UserGroupUserFormByInput />
          </div>
          <h2 className="border-bottom">検索オプション</h2>
          <div className="row mt-4">
            <div className="col-xs-6">
              <div className="checkbox checkbox-info mb-5" key="isAlsoMailSearched">
                <input
                  type="checkbox"
                  id="isAlsoMailSearched"
                  className="form-check-input"
                  checked={userGroupDetailContainer.state.isAlsoMailSearched}
                  onChange={userGroupDetailContainer.switchIsAlsoMailSearched}
                />
                <label className="text-capitalize form-check-label ml-3" htmlFor="isAlsoMailSearched">
                  Mailも有効にする
                </label>
              </div>
              <div className="checkbox checkbox-info mb-5" key="isAlsoNameSearched">
                <input
                  type="checkbox"
                  id="isAlsoNameSearched"
                  className="form-check-input"
                  checked={userGroupDetailContainer.state.isAlsoNameSearched}
                  onChange={userGroupDetailContainer.switchIsAlsoNameSearched}
                />
                <label className="text-capitalize form-check-label ml-3" htmlFor="isAlsoNameSearched">
                  Nameも有効にする
                </label>
              </div>
            </div>
            <div className="col-xs-6">
              <div className="radio mb-5" key="forwardMatch">
                <input
                  type="radio"
                  id="forwardMatch"
                  className="form-check-radio"
                  checked={userGroupDetailContainer.state.searchType === 'forward'}
                  onChange={() => { userGroupDetailContainer.switchSearchType('forward') }}
                />
                <label className="text-capitalize form-check-label ml-3" htmlFor="forwardMatch">
                  前方一致
                </label>
              </div>
              <div className="radio mb-5" key="partialMatch">
                <input
                  type="radio"
                  id="partialMatch"
                  className="form-check-radio"
                  checked={userGroupDetailContainer.state.searchType === 'partial'}
                  onChange={() => { userGroupDetailContainer.switchSearchType('partial') }}
                />
                <label className="text-capitalize form-check-label ml-3" htmlFor="partialMatch">
                  部分一致
                </label>
              </div>
              <div className="radio mb-5" key="backwardMatch">
                <input
                  type="radio"
                  id="backwardMatch"
                  className="form-check-radio"
                  checked={userGroupDetailContainer.state.searchType === 'backward'}
                  onChange={() => { userGroupDetailContainer.switchSearchType('backward') }}
                />
                <label className="text-capitalize form-check-label ml-3" htmlFor="backwardMatch">
                  後方一致
                </label>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

}

UserGroupUserModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  userGroupDetailContainer: PropTypes.instanceOf(UserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserModalWrapper = (props) => {
  return createSubscribedElement(UserGroupUserModal, props, [AppContainer, UserGroupDetailContainer]);
};

export default withTranslation()(UserGroupUserModalWrapper);
