export default class AttachmentConfigurer {

  configure(md): void {
    // Parse attachment markdown format and add attachment ruler
    md.core.ruler.push('attachment_rule', (state: { tokens: any[]; }) => {
      state.tokens.forEach((token) => {
        if (token.type === 'fence' && token.info === 'attachment') token.type = 'attachment_fence';
      });
    });
    // Add new rule
    md.renderer.rules.attachment_fence = (tokens: { [x: string]: { content: string; }; }, idx: string | number) => {
      const contents = tokens[idx].content.split('\n');
      const attachmentId = contents[0];
      const url = `/attachment/${attachmentId}`;
      const fileName = contents[1];

      return `<div><a class="bg-info text-white" href=${url}>${fileName}</a></div>`;
    };
  }

}
