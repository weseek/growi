import React, { useState } from 'react';

import {
  ModalBody,
} from 'reactstrap';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';


const SelectionButton = (props: { icon: string, label: string, onClick: () => void }): JSX.Element => {
  const { icon, label, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      className={`btn p-4 text-center ${isHovered ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
      style={{ width: '280px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <span
        className="material-symbols-outlined d-block mb-3"
        style={{ fontSize: '48px' }}
      >
        {icon}
      </span>
      <div>{label}</div>
    </button>
  );
};


type Props = {
  //
}

export const AiAssistantManagementPageSelectionMethod = (props: Props): JSX.Element => {
  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">
        <h4 className="text-center mb-4">
          アシスタントの学習元にするページを選択します
        </h4>
        <div className="row justify-content-center">
          <div className="col-auto">
            <SelectionButton icon="manage_search" label="キーワードで検索" onClick={() => {}} />
          </div>

          <div className="col-auto">
            <SelectionButton icon="account_tree" label="ページツリーから選択" onClick={() => {}} />

          </div>
        </div>
      </ModalBody>
    </>
  );
};
