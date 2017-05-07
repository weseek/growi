import emojify from 'emojify.js';

export default class Emoji {

  constructor() {
    // see https://github.com/Ranks/emojify.js/issues/123
    emojify.setConfig({
      img_dir: 'https://github.global.ssl.fastly.net/images/icons/emoji/',
    });
  }

  process(markdown) {
    return emojify.replace(markdown);
  }
}
