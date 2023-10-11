import React, { useEffect, useState } from 'react';

import {
  Modal, ModalBody, ModalHeader, ModalFooter,
} from 'reactstrap';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useImageHistoryModal } from '~/stores/modal';

type HistoryItem = {
  _id: string;
  originalName: string;
  fileSize: string;
  createdAt: string;
  filePathProxied: string;
};

const ImageHistoryModal = (): JSX.Element => {
  const { data: imageHistoryModalData, close: closeImageEditorModal } = useImageHistoryModal();

  const [attachmentHistory, setAttachmentHistory] = useState<{ history: Array<HistoryItem> } | null>(null);
  const [maxHeight, setMaxHeight] = useState('70vh');

  useEffect(() => {
    if (imageHistoryModalData?.imageSrc) {
      const attachmentId = imageHistoryModalData.imageSrc.replace('/attachment/', '');
      apiv3Get(`/attachment/history/${attachmentId}`)
        .then((response) => {
          setAttachmentHistory(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [imageHistoryModalData?.imageSrc]);

  useEffect(() => {
    const updateMaxHeight = () => setMaxHeight(`${window.innerHeight * 0.7}px`);
    window.addEventListener('resize', updateMaxHeight);

    return () => window.removeEventListener('resize', updateMaxHeight);
  }, []);

  const formatDate = (dateString: string) => {
    const options = {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      second: '2-digit' as const,
    };
    return new Date(dateString).toLocaleString('ja-JP', options);
  };

  return (
    <Modal
      style={{ maxWidth: '1000px' }}
      isOpen={imageHistoryModalData?.isOpened ?? false}
      toggle={() => closeImageEditorModal()}
    >
      <ModalHeader>
        ヘッダー
      </ModalHeader>

      <ModalBody className="mx-auto" style={{ maxHeight, overflowY: 'auto' }}>
        {
          attachmentHistory
            ? attachmentHistory.history.map(item => (
              <div key={item._id}>
                <div className="row">
                  <div className="col-4 mb-4">
                    <img src={item.filePathProxied} alt={item.originalName} className="img-fluid" />
                  </div>
                  <div className="col-8">
                    <a href={item.filePathProxied} target="_blank" rel="noopener noreferrer">
                      <p>{item.originalName} ({item.filePathProxied})</p>
                    </a>
                    <p>サイズ: {item.fileSize}バイト</p>
                    <p>作成日: {formatDate(item.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
            : 'No history available'
        }
      </ModalBody>

      <ModalFooter>
        Footer
      </ModalFooter>
    </Modal>
  );
};

export default ImageHistoryModal;
