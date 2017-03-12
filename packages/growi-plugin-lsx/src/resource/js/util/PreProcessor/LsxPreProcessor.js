const stringReplaceAsync = require('string-replace-async');

// TODO change to PostProcessor
export class LsxPreProcessor {

  process(markdown) {
    // get current path from window.location
    let currentPath = window.location.pathname;

    return markdown
      // see: https://regex101.com/r/NQq3s9/2
      .replace(/\$lsx\((.*)\)/g, (all, group1) => {

        const storedItem = sessionStorage.getItem(all);
        if (storedItem) {
          return storedItem;
        }

        const tempHtml = '<i class="fa fa-spinner fa-pulse fa-fw"></i>'
           + `<span class="lsx-blink">${all}</span>`;
        /*
         * TODO regist post processor
         *
        $.get('/_api/plugins/lsx', {currentPath: currentPath, args: group1},
          (res) => {
            // TODO
          })
          .fail((data) => {
            console.error(data);
          });
         */
        return tempHtml;
      });
  }
}
