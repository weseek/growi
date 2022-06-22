
import { testfucn } from '../../../components/PageAttachmentPresentation';

export default class AttachmentConfigurer {

  configure(md): void {
    // Parse attachment markdown format and add attachment ruler
    md.core.ruler.push('attachment_rule', (state) => {
      state.tokens.forEach((token) => {
        if (token.type === 'fence' && token.info === 'attachment') token.type = 'attachment_fence';
      });
      return false;
    });
    // Add new rule
    md.renderer.rules.attachment_fence = (tokens, idx) => {
      const contents = tokens[idx].content.split('\n');
      let attachmentId = null;
      if (contents[0].substr(0, contents[0].indexOf(':')) === 'attachmentId') {
        attachmentId = contents[0].substr(contents[0].indexOf(':') + 1);
      }
      if (attachmentId == null) {
        return '<></>';
      }
      testfucn(attachmentId);
    };
  }

}
