export default class TaskListsConfigurer {
  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.use(require('markdown-it-task-checkbox'), {
      disabled: true,
      divWrap: true,
      divClass: 'checkbox checkbox-primary',
      idPrefix: 'cbx_',
      ulClass: 'task-list',
      liClass: 'task-list-item',
    });
  }
}
