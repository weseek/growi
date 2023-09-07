import React, { useState } from 'react';

import { Picker } from 'emoji-mart';

export const EmojiButton = (): JSX.Element => {
  const [emojiState, setEmojiState] = useState(false);

  const onClickEmojiButtonHandler = () => {
    setEmojiState(!emojiState);
  };

  return (
    <>
      <button type="button" className="btn btn-toolbar-button" onClick={onClickEmojiButtonHandler}>
        <span className="material-icons-outlined fs-6">emoji_emotions</span>
      </button>
      {emojiState && (
        <Picker />
      )}
    </>
  );
};
