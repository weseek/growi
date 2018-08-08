export default class TaskListsConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.use(require('markdown-it-task-lists'), {
      enabled: true,
    });
  }

}
