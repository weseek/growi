import React from 'react';

import {
  ModalHeader, ModalBody, ModalFooter, Input,
} from 'reactstrap';

import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

type Props = {
  instruction: string;
}

export const AiAssistantManagementHome = (props: Props): JSX.Element => {
  const { instruction } = props;

  const { close: closeAiAssistantManagementModal, changePageMode } = useAiAssistantManagementModal();

  return (
    <>
      <ModalHeader tag="h4" toggle={closeAiAssistantManagementModal} className="pe-4">
        <span className="growi-custom-icons growi-ai-assistant-icon me-3 fs-4">ai_assistant</span>
        <span className="fw-bold">新規アシスタントの追加</span> {/* TODO i18n */}
      </ModalHeader>

      <div className="px-4">
        <ModalBody>
          <div className="mb-4 growi-ai-assistant-name">
            <Input
              type="text"
              placeholder="アシスタント名を入力"
              bsSize="lg"
              className="border-0 border-bottom border-2 px-0 rounded-0"
            />
          </div>

          <div className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <span className="text-secondary">アシスタントのメモ</span>
              <span className="badge text-bg-secondary ms-2">任意</span>
            </div>
            <Input
              type="textarea"
              placeholder="内容や用途のメモを表示させることができます"
              rows="4"
            />
            <small className="text-secondary d-block mt-2">
              メモの内容はアシスタントの処理に影響しません。
            </small>
          </div>

          <div>
            <button
              type="button"
              className="btn w-100 d-flex justify-content-between align-items-center py-3 mb-2 border-0"
            >
              <span className="fw-normal">アシスタントの共有</span>
              <div className="d-flex align-items-center text-secondary">
                <span>UserNameのみ</span>
                <span className="material-symbols-outlined ms-2 align-middle">chevron_right</span>
              </div>
            </button>

            <button
              type="button"
              className="btn w-100 d-flex justify-content-between align-items-center py-3 mb-2 border-0"
            >
              <span className="fw-normal">参照ページ</span>
              <div className="d-flex align-items-center text-secondary">
                <span>3ページ</span>
                <span className="material-symbols-outlined ms-2 align-middle">chevron_right</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { changePageMode(AiAssistantManagementModalPageMode.INSTRUCTION) }}
              className="btn w-100 d-flex justify-content-between align-items-center py-3 mb-2 border-0"
            >
              <span className="fw-normal">アシスタントへの指示</span>
              <div className="d-flex align-items-center text-secondary">
                <span className="text-truncate" style={{ maxWidth: '280px' }}>
                  {instruction}
                </span>
                <span className="material-symbols-outlined ms-2 align-middle">chevron_right</span>
              </div>
            </button>
          </div>
        </ModalBody>

        <ModalFooter>
          <button type="button" className="btn btn-outline-secondary" onClick={() => {}}>キャンセル</button>
          <button type="button" className="btn btn-primary" onClick={() => {}}>アシスタントを作成する</button>
        </ModalFooter>
      </div>
    </>
  );
};
