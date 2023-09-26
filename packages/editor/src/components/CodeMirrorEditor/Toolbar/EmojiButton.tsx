import React, { useState } from 'react';

import { Picker } from 'emoji-mart';
import { Modal } from 'reactstrap';

import 'emoji-mart/css/emoji-mart.css';

export const EmojiButton = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <button type="button" className="btn btn-toolbar-button" onClick={toggle}>
        <span className="material-icons-outlined fs-6">emoji_emotions</span>
      </button>
      <Modal isOpen={isOpen} toggle={toggle}>
        <Picker
          onSelect={emoji => console.log(emoji)}
        />
      </Modal>
    </>
  );
};
