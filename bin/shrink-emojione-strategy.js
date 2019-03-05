/**
 * the tool to shrink emojione/emoji_strategy.json and output
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
require('module-alias/register');

const fs = require('graceful-fs');

const helpers = require('@commons/util/helpers');

const emojiStrategy = require('emojione/emoji_strategy.json');
const markdownItEmojiFull = require('markdown-it-emoji/lib/data/full.json');

const OUT = helpers.root('tmp/emoji_strategy_shrinked.json');

const shrinkedMap = {};
for (const unicode in emojiStrategy) {
  const data = emojiStrategy[unicode];
  const shortname = data.shortname.replace(/:/g, '');

  // ignore if it isn't included in markdownItEmojiFull
  if (markdownItEmojiFull[shortname] == null) {
    continue;
  }

  // add
  shrinkedMap[unicode] = data;
}

// write
fs.writeFileSync(OUT, JSON.stringify(shrinkedMap));
