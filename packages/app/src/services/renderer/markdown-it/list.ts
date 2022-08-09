export default class OrderedListConfigurer {


  configure(md): void {


    md.renderer.rules.ordered_list_open = function(tokens, idx, options, env, self) {

      const contents = tokens[idx + 3].content;
      const splittedContent = contents.split('\n');
      let newList;
      if (splittedContent.length > 1) {
        newList += '<ol>';
        splittedContent.forEach((content) => {
          newList += `<li> ${content} </li>`;
        });
        newList += '</ol>';
        return newList;
      }

      return self.renderToken(tokens, idx, options);

    };

  }

}
