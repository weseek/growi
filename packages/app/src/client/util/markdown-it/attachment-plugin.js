
// const render = (attachment-url, code) => {
//   return `<a href='${attachment-url}'>${code}This is Attachment</a>`
// }

// const AttachmentRender = ()

export default class AttachmentConfigurer {

  configure(md) {
    md.core.ruler.push('my_rule', (state) => {
      if (state.src === 'test') {
        state.tokes[0].type = 'attachment_link';
      }
    });
    md.renderer.rules.my_rule = (tokens, idx) => {
      return '<p>This is Test.</p>';
    };
  }

}
