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

  componentDidUpdate(prevProps) {
    if (this.props.emojiSearchText !== prevProps.emojiSearchText) {
      if (this.props.emojiSearchText != null) {
        // Get input element of emoji picker search
        const input = document.querySelector('[id^="emoji-mart-search"]');
        const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        // Set value to input of emoji picker search and trigger the search
        valueSetter.call(input, this.props.emojiSearchText);
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  }

  getTranslation() {
    const { t } = this.props;
    const categories = {};
    [
      'search',
      'recent',
      'smileys',
      'people',
      'nature',
      'foods',
      'activity',
      'places',
      'objects',
      'symbols',
      'flags',
      'custom',
    ].forEach((category) => {
      categories[category] = t(`emoji.categories.${category}`);
    });

    const skintones = {};
    (Array.from(Array(6).keys())).forEach((tone) => {
      skintones[tone + 1] = t(`emoji.skintones.${tone + 1}`);
    });

    const translation = {
      search: t('emoji.search'),
      clear: t('emoji.clear'),
      notfound: t('emoji.notfound'),
      skintext: t('emoji.skintext'),
      categories,
      categorieslabel: t('emoji.categorieslabel'),
      skintones,
    };
    return translation;
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
    const i18n = this.getTranslation();
    return (
      <div className="overlay">
        <div ref={this.emojiPicker}>
          <Picker set="apple" autoFocus onSelect={this.selectEmoji} i18n={i18n} title={t('emoji.title')} />
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
