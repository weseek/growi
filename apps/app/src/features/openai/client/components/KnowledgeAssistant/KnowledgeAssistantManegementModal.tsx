import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input,
} from 'reactstrap';

import { useKnowledgeAssistantModal } from '../../stores/knowledge-assistant';

import styles from './KnowledgeAssistantManegementModal.module.scss';

const moduleClass = styles['grw-knowledge-assistant-manegement'] ?? '';


const KnowledgeAssistantManegementModalSubstance = (): JSX.Element => {
  return (
    <div className="px-4">
      <ModalBody>
        <Form>
          <FormGroup className="mb-4">
            <Label className="mb-2 ">アシスタント名</Label>
            <Input
              type="text"
              placeholder="アシスタント名を入力"
              className="border rounded"
            />
          </FormGroup>

          <FormGroup className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <Label className="mb-0">アシスタントの種類</Label>
              <span className="ms-1 fs-5 material-symbols-outlined text-secondary">help</span>
            </div>
            <div className="d-flex gap-4">
              <FormGroup check>
                <Input type="checkbox" defaultChecked />
                <Label check>ナレッジアシスタント</Label>
              </FormGroup>
              <FormGroup check>
                <Input type="checkbox" />
                <Label check>エディタアシスタント</Label>
              </FormGroup>
              <FormGroup check>
                <Input type="checkbox" />
                <Label check>ラーニングアシスタント</Label>
              </FormGroup>
            </div>
          </FormGroup>

          <FormGroup className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <Label className="mb-0">共有範囲</Label>
              <span className="ms-1 fs-5 material-symbols-outlined text-secondary">help</span>
            </div>
            <Input type="select" className="border rounded w-50">
              <option>自分のみ</option>
            </Input>
          </FormGroup>

          <FormGroup className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <Label className="mb-0">参照するページ</Label>
              <span className="ms-1 fs-5 material-symbols-outlined text-secondary">help</span>
            </div>
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center gap-1"
              onClick={() => {}}
            >
              <span>+</span>
              追加する
            </button>
          </FormGroup>

          <FormGroup>
            <div className="d-flex align-items-center mb-2">
              <Label className="mb-0">アシスタントの役割</Label>
              <span className="ms-1 fs-5 material-symbols-outlined text-secondary">help</span>
            </div>
            <Input
              type="textarea"
              placeholder="アシスタントの役割をいれてください"
              className="border rounded"
              rows={4}
            />
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter className="border-0 pt-0 mb-3">
        <button type="button" className="btn btn-outline-secondary" onClick={() => {}}>キャンセル</button>
        <button type="button" className="btn btn-primary" onClick={() => {}}>作成</button>
      </ModalFooter>
    </div>
  );
};


export const KnowledgeAssistantManegementModal = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: knowledgeAssistantModalData, close: closeKnowledgeAssistantModal } = useKnowledgeAssistantModal();

  const isOpened = knowledgeAssistantModalData?.isOpened ?? false;

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeKnowledgeAssistantModal} className={moduleClass} scrollable>

      <ModalHeader tag="h4" toggle={closeKnowledgeAssistantModal} className="pe-4">
        <span className="growi-custom-icons growi-knowledge-assistant-icon me-3 fs-4">knowledge_assistant</span>
        <span className="fw-bold">新規アシスタントの追加</span> {/* TODO i18n */}
      </ModalHeader>

      { isOpened && (
        <KnowledgeAssistantManegementModalSubstance />
      ) }

    </Modal>
  );
};
