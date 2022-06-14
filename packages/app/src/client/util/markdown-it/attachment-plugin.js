
const render = (attachment-url, code) => {
  return `<a href='${attachment-url}'>${code}This is Attachment</a>`
}

const AttachmentRender = ()

export default class AttachmentConfigurer {

  configure(md) {
    md.use(require('markdown-it-attachemnt'), {
    });
  }

}
