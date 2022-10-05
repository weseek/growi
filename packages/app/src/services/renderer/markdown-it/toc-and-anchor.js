// import markdownItEmojiMart from 'markdown-it-emoji-mart';
// import markdownItToc from 'markdown-it-toc-and-anchor-with-slugid';

import { emojiMartData } from './emoji-mart-data';

export default class TocAndAnchorConfigurer {

  configure(md) {
    // md.use(markdownItEmojiMart, { defs: emojiMartData })
    //   .use(markdownItToc, {
    //     tocLastLevel: 3,
    //     anchorLinkBefore: false,
    //     anchorLinkSymbol: '',
    //     anchorLinkSymbolClassName: 'icon-link',
    //     anchorClassName: 'revision-head-link',
    //   });

    // set toc render function
    md.set({
      tocCallback: (tocMarkdown, tocArray, tocHtml) => {
        // eslint-disable-next-line no-undef
        globalEmitter.emit('renderTocHtml', tocHtml);
      },
    });
  }

}
