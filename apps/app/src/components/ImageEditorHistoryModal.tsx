import React, { useEffect, useState } from 'react';

import { ModalBody, ModalHeader, ModalFooter } from 'reactstrap';

import { apiv3Get } from '~/client/util/apiv3-client';
import type { ImageEditorModalStatus } from '~/stores/modal';

type HistoryItem = {
  _id: string;
  originalName: string;
  fileSize: string;
  createdAt: string;
  filePathProxied: string;
};

type Props = {
  imageEditorModalData?: ImageEditorModalStatus,
  onClickTransitionEditButton: () => void;
};

export const ImageEditorHistoryModal = (props: Props): JSX.Element => {
  const { imageEditorModalData, onClickTransitionEditButton } = props;

  const [attachmentHistory, setAttachmentHistory] = useState<{ history: Array<HistoryItem> } | null>(null);
  const [maxHeight, setMaxHeight] = useState('70vh');

  useEffect(() => {
    if (imageEditorModalData?.imageSrc != null) {
      const attachmentId = imageEditorModalData.imageSrc.replace('/attachment/', '');
      apiv3Get(`/attachment/history/${attachmentId}`)
        .then((response) => {
          setAttachmentHistory(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [imageEditorModalData?.imageSrc]);

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
    <>
      <ModalHeader className="bg-primary text-light">
        編集履歴
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
        <button type="button" className="btn btn-primary mr-2 mx-auto" onClick={() => onClickTransitionEditButton()}>編集に戻る</button>
      </ModalFooter>
    </>
  );
};
