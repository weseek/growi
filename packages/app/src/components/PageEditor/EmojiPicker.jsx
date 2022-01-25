import React from 'react';
import PropTypes from 'prop-types';
import { Picker } from 'emoji-mart';
import { withTranslation } from 'react-i18next';

class EmojiPicker extends React.Component {

  constructor(props) {
    super(props);
    this.emojiPicker = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.selectEmoji = this.selectEmoji.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.emojiPicker && !this.emojiPicker.current.contains(event.target)) {
      this.props.close();
    }
  }

  selectEmoji(emoji) {
    this.props.selectEmoji(emoji);
  }

  render() {
    const { t } = this.props;

    return (
      <div className="overlay">
        <div ref={this.emojiPicker}>
          <Picker set="apple" autoFocus onSelect={this.selectEmoji} />
        </div>
      </div>
    );
  }

}

EmojiPicker.propTypes = {
  t: PropTypes.func.isRequired,
  close: PropTypes.func,
  selectEmoji: PropTypes.func,
  emojiSearchText: PropTypes.string,
};

export default withTranslation()(EmojiPicker);
