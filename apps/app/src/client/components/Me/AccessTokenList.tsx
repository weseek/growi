import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

// TODO: add types for accessTokens
type AccessTokenListProps = {
  accessTokens: any[];
  deleteHandler?: (tokenId: string) => void;
}
export const AccessTokenList = React.memo((props: AccessTokenListProps): JSX.Element => {

  const { t } = useTranslation();
  const { accessTokens, deleteHandler } = props;
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);

  const handleDeleteClick = (tokenId: string) => {
    setTokenToDelete(tokenId);
  };

  const handleConfirmDelete = () => {
    if (tokenToDelete != null && deleteHandler != null) {
      deleteHandler(tokenToDelete);
      setTokenToDelete(null);
    }
  };

  const toggleModal = () => {
    setTokenToDelete(null);
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>description</th>
              <th>expiredAt</th>
              <th>scope</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {(accessTokens.length === 0)
              ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    {t('No access tokens found')}
                  </td>
                </tr>
              )
              : (
                <>{
                  accessTokens.map(token => (
                    <tr key={token._id}>
                      <td>{token.description}</td>
                      <td>{token.expiredAt.toString()}</td>
                      <td>{token.scope.join(', ')}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => handleDeleteClick(token._id)}
                        >
                          {t('Delete')}
                        </button>
                      </td>
                    </tr>
                  ))
                }
                </>
              )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal using Reactstrap */}
      <Modal isOpen={tokenToDelete !== null} toggle={toggleModal} centered>
        <ModalHeader tag="h4" toggle={toggleModal} className="bg-danger text-white">
          <span className="material-symbols-outlined me-1">warning</span>
          {t('Warning')}
        </ModalHeader>
        <ModalBody>
          <p>{t('page_me_access_token.modal.message')}</p>
          <p className="text-danger fw-bold">{t('page_me_access_token.modal.alert')}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            {t('Cancel')}
          </Button>
          <Button color="danger" onClick={handleConfirmDelete}>
            {t('page_me_access_token.delete_token')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
});
AccessTokenList.displayName = 'AccessTokenList';
