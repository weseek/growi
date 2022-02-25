import data from 'emoji-mart/data/all.json';
import { Emoji } from 'emoji-mart';

const DEFAULT_SKIN_TONE = 1;
const DEFAULT_EMOJI_SIZE = 24;

const getNativeEmoji = async(emoji, skin = DEFAULT_SKIN_TONE) => {
  const elem = Emoji({
    set: 'apple',
    emoji,
    skin,
    size: DEFAULT_EMOJI_SIZE,
  });
  return elem ? elem.props['aria-label'].split(',')[0] : null;
};

export const emojiMartData = () => {
  const results = {};
  Object.entries(data.emojis).forEach(async(emoji) => {
    const name = emoji[0];
    if ('skin_variations' in emoji[1]) {
      [...Array(6).keys()].forEach(async(index) => {
        const emojiSkinTone = await getNativeEmoji(name, index + 1);
        if (emojiSkinTone != null && index > 0) {
          results[`${name}::skin-tone-${index + 1}`] = emojiSkinTone;
        }
      });
    }
    else {
      results[name] = await getNativeEmoji(name);
    }
  });
  return results;
};
