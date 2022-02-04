import React from 'react';
import PropTypes from 'prop-types';
import Emoji from './Emoji';

function EmojiPicker(props) {
  return (
    <div className="overlay">
      <div>
        <Emoji close={props.close} selectEmoji={props.selectEmoji} emojiSearchText={props.emojiSearchText} />
      </div>
    </div>
  );
}

EmojiPicker.propTypes = {
  close: PropTypes.func,
  selectEmoji: PropTypes.func,
  emojiSearchText: PropTypes.string,
};

export default EmojiPicker;
