import PageAttachmentPresentation from '../../../components/PageAttachmentPresentation';

export default class AttachmentConfigurer {

  configure(md): void {
    md.core.ruler.push('attachment_rule', (state) => {
      state.tokens.forEach((token) => {
        if (token.type === 'fence' && token.info === 'attachment') token.type = 'attachment_fence';
      });
      return false;
    });
    md.renderer.rules.attachment_fence = (tokens, idx) => {
      // const contents = tokens[idx].content.split('\n');
      // let formData = null;
      // if (contents[0].substr(0, contents[0].indexOf(':')) === 'formData') {
      //   formData = contents[0].substr(contents[0].indexOf(':') + 1);
      // }
      // if (formData == null) {
      //   return '<></>';
      // }
      // const res = apiPostForm('/attachments.add', formData);
      return PageAttachmentPresentation;
    };
  }

}
