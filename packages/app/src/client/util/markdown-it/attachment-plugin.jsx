import React from 'react';

import * as ReactDOMServer from 'react-dom/server';

import PageAttachmentPresentation from '../../../components/PageAttachmentPresentation';

export default class AttachmentConfigurer {

  configure(md) {
    md.core.ruler.push('attachment_rule', (state) => {
      state.tokens.forEach((element) => {
        if (element.type === 'fence' && element.info === 'attachment') element.type = 'attachment_fence';
      });
      return false;
    });
    md.renderer.rules.attachment_fence = (tokens, idx) => {
      // TODO: Create a match statement, regex.
      // EXAMPLE:
      // https://regex101.com/hogehoge
      // const match = ...;
      const contents = tokens[idx].content.split('\n');
      let filename = null;
      let url = null;
      contents.forEach((data) => {
        if (data.substr(0, data.indexOf(':')) === 'filename') {
          filename = data.substr(data.indexOf(':') + 1);
        }
        else if (data.substr(0, data.indexOf(':')) === 'url') {
          url = data.substr(data.indexOf(':') + 1);
        }
      });

      const attachmentRichPresentationObject = <PageAttachmentPresentation fileName={filename} url={url} />;
      const attachmentRichPresentationString = ReactDOMServer.renderToString(attachmentRichPresentationObject);
      return attachmentRichPresentationString;
    };
  }

}
