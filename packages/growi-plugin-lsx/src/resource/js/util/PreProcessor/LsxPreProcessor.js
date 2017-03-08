// TODO change to PostProcessor
export class LsxPreProcessor {
  process(markdown) {
    // get current path from window.location
    let currentPath = window.location.pathname;

    return markdown
      // see: https://regex101.com/r/NQq3s9/2
      .replace(/\$lsx\((.*)\)/g, (all, group1) => {
        // TODO create hash
        let replacementId = 'key_created_by_currentPath_and_args';

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
        return `$$crowi-plugin-lsx$${replacementId}`;
      });
  }
}
