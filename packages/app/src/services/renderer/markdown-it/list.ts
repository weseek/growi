export default class ListConfigurer {


  configure(md): void {

    type ListOject = {
      indent: number,
      content: string,
      parent: number | null
    }

    md.renderer.rules.ordered_list_open = function(tokens, idx, options, env, self) {

      const contents = tokens[idx + 3].content;

      const splittedContent = contents.split('\n');
      if (splittedContent.length > 1) {
        const contentList: ListOject[] = [];
        let prevIndent;
        splittedContent.forEach((content) => {
          const indent = content.match(/^\s*/)[0].length;
          const listObject = {
            indent,
            content,
            parent: indent === 0 ? null : prevIndent,
          };
          prevIndent = indent;
          contentList.push(listObject);
        });

      }
      return self.renderToken(tokens, idx);

    };

  }

}
